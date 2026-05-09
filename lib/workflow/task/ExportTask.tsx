import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { FileTextIcon, LucideProps } from "lucide-react";

export const ExportTask = {
  type: TaskType.EXPORT,
  label: "EXPORT",
  icon: (props: LucideProps) => (
    <FileTextIcon className="stroke-emerald-500" {...props} />
  ),
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: "Input",
      type: TaskParamType.STRING,
      required: true,
      hideField: true,
      hideHandle: true,
    },
    {
      name: "Export Type",
      type: TaskParamType.STRING,
      required: true,
      variant: "select",
      options: ["Word", "Excel", "Google Sheets", "Google Docs"],
      hideHandle: true,
    },
    {
      name: "Field Mapping",
      type: TaskParamType.STRING,
      required: false,
      hideField: true,
      hideHandle: true,
      defaultValue: "[]",
    },
    {
      name: "Data Source Profile",
      type: TaskParamType.STRING,
      required: false,
      hideHandle: true,
      readOnly: true,
      defaultValue: "",
    },
    {
      name: "Google Account",
      type: TaskParamType.STRING,
      required: false,
      hideField: true,
      hideHandle: true,
      defaultValue: "",
    },
    {
      name: "Document ID",
      type: TaskParamType.STRING,
      required: false,
      hideField: true,
      hideHandle: true,
      defaultValue: "",
    },
    {
      name: "Spreadsheet ID",
      type: TaskParamType.STRING,
      required: false,
      hideField: true,
      hideHandle: true,
      defaultValue: "",
    },
    {
      name: "File Name",
      type: TaskParamType.STRING,
      required: false,
      hideField: true,
      hideHandle: true,
      defaultValue: "",
    },
  ] as const,
  outputs: [
    {
      name: "Export Payload",
      type: TaskParamType.STRING,
    },
    {
      name: "Export Result",
      type: TaskParamType.STRING,
    },
  ] as const,
} satisfies WorkflowTask;
