import "server-only";

import prisma from "@/lib/prisma";
import { FieldMappingRow } from "@/lib/workflow/executor/exportTransformer";

type GoogleExportProvider = "google_export";

type GoogleCredentials = {
  userId: string;
  provider: GoogleExportProvider;
  email: string;
  accessToken: string;
  refreshToken?: string | null;
  expiryDate?: Date | null;
};

type ExecuteGoogleExportParams = {
  userId: string;
  exportType: "Google Docs" | "Google Sheets";
  payload: unknown;
  documentId?: string;
  spreadsheetId?: string;
  appendToEnd?: boolean;
};

function isTokenExpired(expiryDate?: Date | null) {
  if (!expiryDate) return true;
  return expiryDate.getTime() <= Date.now() + 30_000;
}

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");

  const body = new URLSearchParams();
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("refresh_token", refreshToken);
  body.set("grant_type", "refresh_token");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const json = (await res.json()) as any;
  if (!res.ok) {
    const msg = json?.error_description || json?.error || "Failed to refresh token";
    throw new Error(msg);
  }

  return {
    accessToken: String(json.access_token || ""),
    expiresIn: Number(json.expires_in || 0),
  };
}

async function getGoogleCredentials(userId: string): Promise<GoogleCredentials> {
  const cred = await prisma.userCredentials.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: "google_export",
      },
    },
  });

  if (!cred) throw new Error("Google account is not connected");

  return {
    userId: cred.userId,
    provider: cred.provider as GoogleExportProvider,
    email: cred.email,
    accessToken: cred.accessToken,
    refreshToken: cred.refreshToken,
    expiryDate: cred.expiryDate,
  };
}

async function ensureValidAccessToken(userId: string) {
  const cred = await getGoogleCredentials(userId);

  if (!isTokenExpired(cred.expiryDate)) {
    return { accessToken: cred.accessToken, email: cred.email };
  }

  if (!cred.refreshToken) {
    throw new Error("Google refresh_token is missing. Please reconnect Google with consent.");
  }

  const refreshed = await refreshAccessToken(cred.refreshToken);
  if (!refreshed.accessToken) throw new Error("Failed to refresh Google access token");

  const expiryDate = new Date(Date.now() + (refreshed.expiresIn || 0) * 1000);

  await prisma.userCredentials.update({
    where: {
      userId_provider: {
        userId,
        provider: "google_export",
      },
    },
    data: {
      accessToken: refreshed.accessToken,
      expiryDate,
    },
  });

  return { accessToken: refreshed.accessToken, email: cred.email };
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function normalizeMapping(mappingRaw: string | undefined): FieldMappingRow[] {
  const raw = String(mappingRaw ?? "[]");
  const parsed = safeJsonParse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((r: any) => ({
      column: String(r?.column ?? "").trim(),
      value: String(r?.value ?? "").trim(),
    }))
    .filter((r: FieldMappingRow) => r.column.length > 0 && r.value.length > 0);
}

function pick(obj: any, path: string): any {
  if (!obj || typeof obj !== "object") return "";
  const parts = String(path || "")
    .split(".")
    .filter(Boolean);
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return "";
    cur = cur[p];
  }
  if (cur === undefined || cur === null) return "";
  if (typeof cur === "object") return JSON.stringify(cur);
  return cur;
}

function buildSheetAppendValues(payload: any, fieldMappingRaw?: string) {
  const mapping = normalizeMapping(fieldMappingRaw);

  // Primary path: payload already mapped in ExportExecutor via transformForExport.
  // Expect: payload.profile === 'array' and includes columns + rows.
  const columns = payload?.columns;
  const rows = payload?.rows;

  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error("Missing columns for Google Sheets export");
  }

  if (!Array.isArray(rows)) {
    if (payload?.row && typeof payload.row === "object") {
      const rowArr = mapping.length
        ? mapping.map((m) => pick(payload.row, m.value))
        : columns.map((c: string) => pick(payload.row, c));
      return {
        header: columns,
        values: [columns, rowArr],
      };
    }
    throw new Error("Missing rows for Google Sheets export");
  }

  const valueRows = rows.map((r: any) => {
    // If mapping is provided, it can remap from raw objects; otherwise take by column names.
    if (mapping.length > 0) return mapping.map((m) => pick(r, m.value));
    return columns.map((c: string) => pick(r, c));
  });

  return {
    header: columns,
    values: [columns, ...valueRows],
  };
}

export async function executeGoogleExport(params: ExecuteGoogleExportParams) {
  const { accessToken, email } = await ensureValidAccessToken(params.userId);

  if (params.exportType === "Google Docs") {
    const docId = (params.documentId || "").trim();
    if (!docId) throw new Error("Missing Document ID");

    const payload = params.payload as any;
    const text =
      typeof payload?.contentMarkdown === "string"
        ? payload.contentMarkdown
        : typeof payload?.content === "string"
          ? payload.content
          : typeof payload === "string"
            ? payload
            : JSON.stringify(payload ?? "");

    let insertIndex = 1;
    if (params.appendToEnd) {
      const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const docJson = (await docRes.json()) as any;
      if (!docRes.ok) {
        const msg = docJson?.error?.message || "Failed to fetch document";
        throw new Error(msg);
      }

      const content = docJson?.body?.content;
      if (Array.isArray(content) && content.length > 0) {
        const last = content[content.length - 1];
        const endIndex = Number(last?.endIndex);
        if (!Number.isNaN(endIndex) && endIndex > 1) {
          insertIndex = endIndex - 1;
        }
      }
    }

    const res = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: insertIndex },
              text: text + "\n",
            },
          },
        ],
      }),
    });

    const json = (await res.json()) as any;
    if (!res.ok) {
      const msg = json?.error?.message || "Google Docs batchUpdate failed";
      throw new Error(msg);
    }

    return {
      provider: "google_export" as const,
      exportType: "Google Docs" as const,
      email,
      documentId: docId,
      response: json,
    };
  }

  if (params.exportType === "Google Sheets") {
    const sheetId = (params.spreadsheetId || "").trim();
    if (!sheetId) throw new Error("Missing Spreadsheet ID");

    const payload = params.payload as any;

    // transformForExport already applied the UI Field Mapping to produce columns + rows.
    // We still allow an optional mappingRaw for future use.
    const { values } = buildSheetAppendValues(payload, undefined);

    const range = "Sheet1!A1";
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
        range
      )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    const json = (await res.json()) as any;
    if (!res.ok) {
      const msg = json?.error?.message || "Google Sheets values.append failed";
      throw new Error(msg);
    }

    return {
      provider: "google_export" as const,
      exportType: "Google Sheets" as const,
      email,
      spreadsheetId: sheetId,
      response: json,
    };
  }

  throw new Error(`Unsupported exportType: ${params.exportType}`);
}
