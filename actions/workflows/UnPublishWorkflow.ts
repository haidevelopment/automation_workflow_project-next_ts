"use server"

import prisma from "@/lib/prisma";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { CaculateWorkflowCost } from "@/lib/workflow/helpers";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function UnPublishWorkflow({ id, flowDefinition }: { id: string, flowDefinition: string }) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }
    const workflow = await prisma.workflow.findUnique({
        where: {
            id,
            userId,
        },
    });
    if (!workflow) {
        throw new Error("Workflow Not Found");
    }
    if (workflow.status !== WorkflowStatus.PUBLISHER) {
        throw new Error("Workflow is not a Published")
    }
    const flow = JSON.parse(flowDefinition);
    const result = FlowToExecutionPlan(flow.nodes, flow.edges);
    if(result.error){
        throw new Error("Flow Definition are not valid");
    }
    if(!result.executionPlan){
        throw new Error("No execution plan generated");
    }
    const creditsCost = CaculateWorkflowCost(flow.nodes);
    await prisma.workflow.update({
        data: {
            status: WorkflowStatus.DRAF,
            definition: flowDefinition,
            executionPlan: JSON.stringify(result.executionPlan),
            creditsCost,
        },
        where: {
            id,
            userId,
        },
    });
    revalidatePath(`/workflow/editor/${id}`);
}