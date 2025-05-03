"use server";

import { createWorkflowSchemaType, workflowSchema } from "@/schema/workflow";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { redirect } from "next/navigation";
import { TaskType } from "@/types/task";
import { AppNode } from "@/types/appNode";
import { Edge } from "@xyflow/react";
import { CreateFlowNode } from "@/lib/workflow/CreateFlowNode";

export async function CreateWorkflow(form: createWorkflowSchemaType) {
  const { success, data } = workflowSchema.safeParse(form);
  
  if (!success) {
    throw new Error("invalid form data");
  }
  const { userId } = await auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }
  const initialFlow:{nodes:AppNode[],edges:Edge[]} = {
    nodes: [],
    edges: [],
  }
  initialFlow.nodes.push(CreateFlowNode(TaskType.LAUCH_BROWSER));
  const result = await prisma.workflow.create({
    data:{
        userId,
        status:WorkflowStatus.DRAF,
        definition:JSON.stringify(initialFlow),
        ...data,
    }
  });
  if(!result){
     throw new Error("failed to create workflow");
  }
  redirect(`/workflow/editor/${result.id}`);
}
