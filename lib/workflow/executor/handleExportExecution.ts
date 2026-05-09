import "server-only";

import { ExecutionEnvironment } from "@/types/executor";
import { ExportTask } from "../task/ExportTask";
import { executeGoogleExport } from "../services/executeGoogleExport";

type ExportExecutionResult =
  | {
      kind: "google";
      url: string;
      message: string;
    }
  | {
      kind: "local";
      downloadUrl: string;
      message: string;
    };

function getAppUrl(path: string) {
  const explicitBase = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (explicitBase && explicitBase.trim().length > 0) {
    return new URL(path, explicitBase).toString();
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && vercelUrl.trim().length > 0) {
    return new URL(path, `https://${vercelUrl}`).toString();
  }

  const port = process.env.PORT || "3000";
  return new URL(path, `http://localhost:${port}`).toString();
}

export async function handleExportExecution(
  environment: ExecutionEnvironment<typeof ExportTask>,
  payloadWithMeta: any
): Promise<ExportExecutionResult> {
  const exportType = environment.getInput("Export Type");

  if (exportType === "Google Docs") {
    const userId = environment.getUserId();
    if (!userId) throw new Error("Missing userId for Google export");

    const documentId = environment.getInput("Document ID");
    const r = await executeGoogleExport({
      userId,
      exportType: "Google Docs",
      payload: payloadWithMeta,
      documentId: String(documentId ?? ""),
    });

    const url = `https://docs.google.com/document/d/${r.documentId}/edit`;
    return {
      kind: "google",
      url,
      message: "Đã cập nhật Google Docs",
    };
  }

  if (exportType === "Google Sheets") {
    const userId = environment.getUserId();
    if (!userId) throw new Error("Missing userId for Google export");

    const spreadsheetId = environment.getInput("Spreadsheet ID");
    const r = await executeGoogleExport({
      userId,
      exportType: "Google Sheets",
      payload: payloadWithMeta,
      spreadsheetId: String(spreadsheetId ?? ""),
    });

    const url = `https://docs.google.com/spreadsheets/d/${r.spreadsheetId}/edit`;
    return {
      kind: "google",
      url,
      message: "Đã thêm 1 hàng vào Google Sheets",
    };
  }

  if (exportType === "Word" || exportType === "Excel") {
    const apiSecret = process.env.API_SECRET;
    const userId = environment.getUserId();

    const res = await fetch(getAppUrl("/api/workflow/export-file"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiSecret ? { Authorization: `Bearer ${apiSecret}` } : {}),
      },
      body: JSON.stringify({
        exportType,
        payload: payloadWithMeta,
        userId,
      }),
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "";
    const rawText = await res.text();
    const json = contentType.includes("application/json")
      ? ((JSON.parse(rawText) as any) ?? {})
      : ({} as any);
    if (!res.ok) {
      const fallback = rawText?.slice(0, 400) || "Export file failed";
      throw new Error(String(json?.error ?? fallback));
    }

    const downloadUrl = String(json?.downloadUrl ?? "");
    if (!downloadUrl) throw new Error("Missing downloadUrl");

    return {
      kind: "local",
      downloadUrl,
      message: exportType === "Excel" ? "Đã khởi tạo file Excel thành công" : "Đã khởi tạo file Word thành công",
    };
  }

  throw new Error(`Unsupported Export Type: ${String(exportType)}`);
}
