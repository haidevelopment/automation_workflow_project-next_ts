import { ExecutionEnvironment } from "@/types/executor";
import { AITask } from "../task/AITask";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const DEFAULT_TIMEOUT_MS = 30_000;

function getEncryptionKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("Missing env: CREDENTIALS_ENCRYPTION_KEY");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY must be 32 bytes base64 (AES-256-GCM)");
  }
  return key;
}

function decryptValue(encrypted: string): string {
  const key = getEncryptionKey();
  const parts = String(encrypted || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted payload format");
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString("utf8");
}

const FIXED_SYSTEM_PROMPT =
  "Bạn là một chuyên gia phân tích dữ liệu trong hệ thống AutomationFlow. Nhiệm vụ của bạn là tiếp nhận dữ liệu từ các node phía trước (có thể là HTML thô hoặc văn bản đã trích xuất) và xử lý chúng dựa trên yêu cầu của người dùng.\n\nNếu dữ liệu là HTML: Hãy tập trung vào nội dung chính, loại bỏ các thẻ rác.\n\nNếu người dùng có yêu cầu bổ sung: Hãy ưu tiên thực hiện yêu cầu đó.\n\nĐịnh dạng đầu ra: Luôn ưu tiên trả về định dạng JSON nếu dữ liệu có cấu trúc (danh sách, bảng, thuộc tính). Nếu là văn bản phân tích, hãy dùng Markdown để trình bày rõ ràng.\n\nNgôn ngữ: Luôn trả lời bằng ngôn ngữ giống với dữ liệu đầu vào hoặc theo yêu cầu cụ thể.\n\nQUY TẮC BẮT BUỘC VỀ ĐẦU RA:\n- Chỉ trả về KẾT QUẢ CUỐI CÙNG theo đúng định dạng yêu cầu (JSON hoặc Markdown).\n- KHÔNG được thêm lời dẫn, lời giải thích, ghi chú, xin lỗi, hoặc câu chữ xã giao (ví dụ: 'Dưới đây là...', 'Tôi sẽ...', 'Hy vọng...').\n- KHÔNG bọc JSON trong markdown code block (không dùng ```json).\n- Nếu trả về JSON: phải là JSON hợp lệ, không có ký tự thừa trước/sau.";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimeout?: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      try {
        onTimeout?.();
      } catch {}
      reject(new Error(`AI request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => resolve(result))
      .catch((err) => reject(err))
      .finally(() => clearTimeout(timeoutId));
  });
}

function buildPrompt(inputData: string, userRequirement?: string) {
  const trimmedRequirement = (userRequirement ?? "").trim();
  if (!trimmedRequirement) return inputData;
  return [
    "Input data:",
    inputData,
    "",
    "Additional user requirement:",
    trimmedRequirement,
  ].join("\n");
}

function normalizeProvider(provider: string) {
  if (provider === "OpenAI") return "OpenAI" as const;
  if (provider === "Google Gemini") return "Google Gemini" as const;
  throw new Error(`Unsupported provider: ${provider}`);
}

export async function AIExecutor(
  enviroment: ExecutionEnvironment<typeof AITask>
): Promise<boolean> {
  try {
    const inputData = enviroment.getInput("Input");
    const providerRaw = enviroment.getInput("Provider");
    const provider = normalizeProvider(providerRaw);
    const model = enviroment.getInput("Model");
    const credentialId = enviroment.getInput("Credentials");
    const userRequirement = enviroment.getInput("User Requirement");

    if (!credentialId) {
      enviroment.log.error("Vui lòng chọn Credentials trong cấu hình Node");
      return false;
    }

    const credential = await (prisma as any).credentials.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      enviroment.log.error("Không tìm thấy thông tin Credentials trong hệ thống");
      return false;
    }

    const apiKey = decryptValue(credential.value);

    if (!apiKey || apiKey.trim().length === 0) {
      enviroment.log.error("API Key rỗng sau khi giải mã");
      return false;
    }

    if (!model || model.trim().length === 0) {
      enviroment.log.error("Missing Model");
      return false;
    }

    enviroment.log.info("Đang xử lý prompt...");
    const prompt = buildPrompt(inputData ?? "", userRequirement);
    const timeoutMs = DEFAULT_TIMEOUT_MS;

    if (provider === "OpenAI") {
      enviroment.log.info(`Gửi request đến OpenAI (model: ${model})...`);
      const controller = new AbortController();
      const client = new OpenAI({ apiKey });

      const request = client.chat.completions.create(
        {
          model,
          messages: [
            { role: "system", content: FIXED_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
        },
        {
          signal: controller.signal,
        }
      );

      const response = (await withTimeout(
        request,
        timeoutMs,
        () => controller.abort()
      )) as Awaited<typeof request>;
      const content = response.choices?.[0]?.message?.content ?? "";
      enviroment.log.info(`Nhận kết quả thành công (độ dài ${content.length} ký tự)`);
      enviroment.setOutput("Output", content);
      return true;
    }

    if (provider === "Google Gemini") {
      enviroment.log.info(`Gửi request đến Gemini (model: ${model})...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model });

      const request = geminiModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: [FIXED_SYSTEM_PROMPT, prompt].filter(Boolean).join("\n\n") }],
          },
        ],
      });

      const result = (await withTimeout(request, timeoutMs)) as Awaited<typeof request>;
      const text = result.response.text();
      enviroment.log.info(`Nhận kết quả thành công (độ dài ${text.length} ký tự)`);
      enviroment.setOutput("Output", text);
      return true;
    }

    enviroment.log.error(`Unsupported provider: ${providerRaw}`);
    return false;
  } catch (error: any) {
    const status = error?.status ?? error?.response?.status;
    const message = error?.message ?? String(error);
    const raw = String(error ?? "");

    if (
      status === 401 ||
      status === 403 ||
      message.includes("API_KEY_INVALID") ||
      message.toLowerCase().includes("api key not valid") ||
      raw.includes("API_KEY_INVALID")
    ) {
      enviroment.log.error("API Key không hợp lệ hoặc không đủ quyền (Unauthorized)");
      return false;
    }

    enviroment.log.error(`AI Node failed: ${message}`);
    enviroment.log.error(message);
    return false;
  }
}
