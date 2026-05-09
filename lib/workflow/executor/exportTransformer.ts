// eslint-disable-next-line @typescript-eslint/no-var-requires
const TurndownService = require("turndown");

export type ExportType = "Word" | "Excel" | "Google Sheets" | "Google Docs";

export type FieldMappingRow = {
  column: string;
  value: string;
};

export type ExportPayload =
  | {
      exportType: ExportType;
      profile: "string" | "html";
      contentMarkdown: string;
    }
  | {
      exportType: ExportType;
      profile: "array";
      columns: string[];
      rows: Record<string, any>[];
    }
  | {
      exportType: ExportType;
      profile: "object";
      columns: string[];
      row: Record<string, any>;
    };

function isHtmlLike(text: string) {
  const t = text.trim();
  if (!t) return false;
  if (t.startsWith("<!DOCTYPE")) return true;
  if (t.startsWith("<html")) return true;
  return /<\w+[^>]*>/.test(t);
}

function oneLine(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function safeParseJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

function normalizeMapping(mappingRaw: string | undefined): FieldMappingRow[] {
  const raw = String(mappingRaw ?? "[]");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((r: any) => ({ column: String(r?.column ?? "").trim(), value: String(r?.value ?? "").trim() }))
      .filter((r: FieldMappingRow) => r.column.length > 0 && r.value.length > 0);
  } catch {
    return [];
  }
}

function pick(obj: any, path: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  if (!path) return undefined;

  // Minimal: support dot paths (a.b.c). No arrays for now.
  const parts = path.split(".").filter(Boolean);
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function transformForExport(params: {
  inputData: unknown;
  fieldMappingRaw?: string;
  exportType: ExportType;
}): ExportPayload {
  const { exportType } = params;
  const fieldMapping = normalizeMapping(params.fieldMappingRaw);

  const inputStr = typeof params.inputData === "string" ? params.inputData : JSON.stringify(params.inputData ?? "");
  const trimmed = String(inputStr ?? "").trim();

  const json = typeof params.inputData === "string" ? safeParseJson(trimmed) : params.inputData;

  // JSON object/array handling
  if (Array.isArray(json)) {
    if (fieldMapping.length === 0) {
      return {
        exportType,
        profile: "array",
        columns: ["data"],
        rows: [{ data: oneLine(JSON.stringify(json)) }],
      };
    }

    const columns = fieldMapping.map((m) => m.column);
    const rows = json.map((item: any) => {
      const out: Record<string, any> = {};
      for (const m of fieldMapping) {
        out[m.column] = pick(item, m.value);
      }
      return out;
    });

    return {
      exportType,
      profile: "array",
      columns,
      rows,
    };
  }

  if (json && typeof json === "object") {
    if (fieldMapping.length === 0) {
      return {
        exportType,
        profile: "object",
        columns: ["data"],
        row: { data: oneLine(JSON.stringify(json)) },
      };
    }

    const columns = fieldMapping.map((m) => m.column);
    const row: Record<string, any> = {};
    for (const m of fieldMapping) {
      row[m.column] = pick(json, m.value);
    }

    return {
      exportType,
      profile: "object",
      columns,
      row,
    };
  }

  // String / HTML handling
  if (isHtmlLike(trimmed)) {
    const turndown = new TurndownService({
      codeBlockStyle: "fenced",
      headingStyle: "atx",
    });

    const md = turndown.turndown(trimmed);
    return {
      exportType,
      profile: "html",
      contentMarkdown: md,
    };
  }

  // Default: raw single line
  return {
    exportType,
    profile: "string",
    contentMarkdown: oneLine(trimmed),
  };
}
