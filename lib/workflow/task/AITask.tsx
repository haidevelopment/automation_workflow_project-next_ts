import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { BotIcon } from "lucide-react";

export const AITask = {
  type: TaskType.AI,
  label: "AI NODE",
  icon: (props) => <BotIcon className="stroke-violet-500" {...props} />,
  isEntryPoint: false,
  credits: 5,
  inputs: [
    {
      name: "Input",
      type: TaskParamType.STRING,
      required: true,
      hideField: true,
      hideHandle: true,
    },
    {
      name: "Provider",
      type: TaskParamType.STRING,
      required: true,
      variant: "select",
      options: ["OpenAI", "Google Gemini"],
      hideHandle: true,
    },
    {
      name: "Model",
      type: TaskParamType.STRING,
      required: true,
      variant: "select",
      optionsByProvider: {
        OpenAI: ["gpt-4o", "gpt-3.5-turbo"],
        "Google Gemini": [
          "gemini-1.5-flash",
          "gemini-1.5-flash-8b",
          "gemini-1.5-pro",
          "gemini-2.0-flash",
          "gemini-2.0-pro",
        ],
      },
      dependsOn: "Provider",
      hideHandle: true,
    },
    {
      name: "Credentials",
      type: TaskParamType.CREDENTIAL,
      required: true,
      dependsOn: "Provider",
      hideHandle: true,
    },
    {
      name: "System Prompt",
      type: TaskParamType.STRING,
      required: false,
      variant: "textarea",
      readOnly: true,
      defaultValue:
        "You are a system agent that receives input data from previous workflow nodes and produces the best possible output for the next step.",
      hideField: true,
      hideHandle: true,
    },
    {
      name: "User Requirement",
      type: TaskParamType.STRING,
      required: false,
      variant: "textarea",
      hideHandle: true,
    },
  ] as const,
  outputs: [
    {
      name: "Output",
      type: TaskParamType.STRING,
    },
  ] as const,
} satisfies WorkflowTask;
