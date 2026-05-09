import { ExecutionEnvironment } from "@/types/executor";
import { ExportTask } from "../task/ExportTask";
import { transformForExport } from "./exportTransformer";
import { handleExportExecution } from "./handleExportExecution";

export async function ExportExecutor(
  environment: ExecutionEnvironment<typeof ExportTask>
): Promise<boolean> {
  try {
    const input = environment.getInput("Input");
    const exportType = environment.getInput("Export Type");
    const fieldMappingRaw = environment.getInput("Field Mapping");
    const documentId = environment.getInput("Document ID");
    const spreadsheetId = environment.getInput("Spreadsheet ID");
    const fileName = environment.getInput("File Name");

    if (!exportType || String(exportType).trim().length === 0) {
      environment.log.error("Missing Export Type");
      return false;
    }

    if (input === undefined || input === null || String(input).trim().length === 0) {
      environment.log.error("Missing Input");
      return false;
    }

    const payload = transformForExport({
      inputData: input,
      fieldMappingRaw: String(fieldMappingRaw ?? ""),
      exportType: exportType as any,
    });

    const payloadWithMeta = {
      ...(payload as any),
      fileName: String(fileName ?? "").trim() || undefined,
    };

    environment.setOutput("Export Payload", JSON.stringify(payloadWithMeta));
    environment.log.info(`Prepared export (${exportType})`);

    const result = await handleExportExecution(environment, payloadWithMeta);
    environment.setOutput("Export Result", JSON.stringify(result));
    environment.log.info(result.message);
    if (result.kind === "google") {
      environment.log.info(result.url);
    }
    if (result.kind === "local") {
      environment.log.info(result.downloadUrl);
    }

    return true;
  } catch (error: any) {
    environment.log.error(error?.message ?? String(error));
    return false;
  }
}
