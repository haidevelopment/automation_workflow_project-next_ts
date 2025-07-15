import {z} from "zod"
export const workflowSchema =z.object({
    name:z.string().max(50),
    description:z.string().max(80).optional(),
 
 });
 export type createWorkflowSchemaType = z.infer<typeof workflowSchema>
 export const duplicateWorkflowSchema = workflowSchema.extend({
    workflowId:z.string()
 })
 export type duplicateWorkflowSchemaType = z.infer<typeof duplicateWorkflowSchema>