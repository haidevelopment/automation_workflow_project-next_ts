import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, TextRun } from "docx";

const TTL_MS = 30 * 60 * 1000;

function isValidSecret(secret: string): boolean {
  const API_SECRET = process.env.API_SECRET;
  if (!API_SECRET) return false;
  try {
    return timingSafeEqual(Buffer.from(API_SECRET), Buffer.from(secret));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const hasBearer = authHeader.startsWith("Bearer ");
  const bearerSecret = hasBearer ? authHeader.slice("Bearer ".length) : "";
  const isInternal = bearerSecret ? isValidSecret(bearerSecret) : false;

  const body = (await req.json().catch(() => null)) as any;

  const clerk = await auth();
  const userId = isInternal ? String(body?.userId ?? "").trim() : clerk.userId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exportType = String(body?.exportType ?? "");
  const payload = body?.payload;

  if (exportType !== "Word" && exportType !== "Excel") {
    return NextResponse.json({ error: "Unsupported exportType" }, { status: 400 });
  }

  // Minimal stub: we don't generate real docx/xlsx yet.
  // We return a token that later can be used for download.
  const token = crypto.randomBytes(24).toString("hex");

  globalThis.__EXPORT_FILE_STORE__ = globalThis.__EXPORT_FILE_STORE__ || new Map();
  const store: Map<string, any> = globalThis.__EXPORT_FILE_STORE__;

  const fileName = String(payload?.fileName ?? "export").trim() || "export";
  const ext = exportType === "Excel" ? "xlsx" : "docx";

  let buffer: Buffer;
  if (exportType === "Word") {
    const markdown = String(payload?.contentMarkdown ?? "").trim();
    const content = markdown.length > 0 ? markdown : JSON.stringify(payload ?? {}, null, 2);
    const lines = content.split(/\r?\n/);

    const doc = new Document({
      sections: [
        {
          children: lines.map((line) =>
            new Paragraph({
              children: [new TextRun({ text: line })],
            })
          ),
        },
      ],
    });

    const uint8 = await Packer.toBuffer(doc);
    buffer = Buffer.from(uint8);
  } else {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Export");

    const columns = Array.isArray(payload?.columns) ? payload.columns : [];
    const rows = Array.isArray(payload?.rows) ? payload.rows : [];

    if (columns.length > 0) {
      sheet.addRow(columns);
      for (const row of rows) {
        if (Array.isArray(row)) {
          sheet.addRow(row);
        } else if (row && typeof row === "object") {
          sheet.addRow(columns.map((c: any) => (row as any)[String(c)]));
        } else {
          sheet.addRow([String(row ?? "")]);
        }
      }
    } else if (payload && typeof payload === "object") {
      sheet.addRow(["key", "value"]);
      for (const [k, v] of Object.entries(payload)) {
        sheet.addRow([k, typeof v === "string" ? v : JSON.stringify(v)]);
      }
    } else {
      sheet.addRow(["value"]);
      sheet.addRow([String(payload ?? "")]);
    }

    const arrayBuffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
    buffer = Buffer.from(new Uint8Array(arrayBuffer));
  }

  store.set(token, {
    buffer,
    fileName: `${fileName}.${ext}`,
    contentType: exportType === "Excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    expiresAt: Date.now() + TTL_MS,
    userId,
  });

  return NextResponse.json({
    downloadUrl: `/api/workflow/export-file/download?token=${token}`,
  });
}

declare global {
  // eslint-disable-next-line no-var
  var __EXPORT_FILE_STORE__: Map<string, any> | undefined;
}
