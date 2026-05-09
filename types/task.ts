export enum TaskType{
    LAUNCH_BROWSER="LAUNCH_BROWSER",
    PAGE_TO_HTML="PAGE_TO_HTML",
    EXTRACT_TEXT_FROM_ELEMENT="EXTRACT_TEXT_FROM_ELEMENT",
    FILL_INPUT="FILL_INPUT",
    AI="AI",
    EXPORT="EXPORT",
}
export enum TaskParamType{
    STRING="STRING",
    BROWSER_INSTANCE="BROWSER_INSTANCE",
    CREDENTIAL="CREDENTIAL",
}
export interface TaskParam{
    name:string;
    type:TaskParamType;
    helperText?:string;
    required?:boolean;
    hideHandle?:boolean;
    value?:string;
    [key:string]:any;
}