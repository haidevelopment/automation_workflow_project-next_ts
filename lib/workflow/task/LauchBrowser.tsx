import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { GlobeIcon, LucideProps } from "lucide-react";

export const LaunchBrowserTask ={
    type:TaskType.LAUCH_BROWSER,
    label:"Launch Browser",
    icon:(props:LucideProps) => (<GlobeIcon className="stroke-pink-400" {...props} />),
    isEntryPoint:true,
    credits:5,
    inputs:[
        {
            name:"Website Url",
            type:TaskParamType.STRING,
            helperText:"eg: https://www.google.com",
            required:true,
            hideHandle:true
        }
    ],
    outputs:[{
        name:"Web Page",
        type:TaskParamType.BROWSER_INSTANCE
    }]
} satisfies WorkflowTask;