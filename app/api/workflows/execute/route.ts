import prisma from "@/lib/prisma";
import { ExecutionWorkflow } from "@/lib/workflow/ExecutionWorkflow";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, WorkflowExecutionStatus, WorkflowExecutionTrigger } from "@/types/workflow";
import { timingSafeEqual } from "crypto";
import CronExpressionParser from 'cron-parser'

function isValidSecret(secret: string): boolean {
    const API_SECRET = process.env.API_SECRET;
    if (!API_SECRET) return false;
    try {
        return timingSafeEqual(Buffer.from(API_SECRET), Buffer.from(secret));
    } catch (error) {
        return false;
    }
}
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return Response.json({ error: 'Unauthorized', status: 401 });
    }
    const secret = authHeader.split(' ')[1];
    if (!isValidSecret(secret)) {
        return Response.json({ error: 'Unauthorized', status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    if (!workflowId) {
        return Response.json({ error: 'workflowId is required', status: 400 });
    }
    const wokflow = await prisma.workflow.findUnique({
        where: {
            id: workflowId
        }
    });
    if (!wokflow) {
        return Response.json({ error: 'workflow not found', status: 404 });
    }
    const executionPlan = JSON.parse(wokflow.executionPlan!) as WorkflowExecutionPlan;
    if (!executionPlan) {
        return Response.json({ error: 'execution plan not found', status: 404 });
    }
    let nextRun;
    try {
        const cron = CronExpressionParser.parse(wokflow.cron!);
         nextRun = cron.next().toISOString();
    } catch (error) {
        return Response.json({ error: 'Interal Server Error', status: 500 }); 
    }
    const execution = await prisma.workflowExecution.create({
        data: {
            workflowId,
            userId: wokflow.userId,
            definition: wokflow.definition,
            status: WorkflowExecutionStatus.PENDING,
            startedAt: new Date(),
            strigger: WorkflowExecutionTrigger.CRON,
            phases: {
                create: executionPlan.flatMap((phase) => {
                    return phase.nodes.flatMap(node => {
                        return {
                            userId: wokflow.userId,
                            status: ExecutionPhaseStatus.CREATED,
                            number: phase.phase,
                            node: JSON.stringify(node),
                            name: TaskRegistry[node.data.type].label,

                        }
                    })
                })
            }
        }
    });
    await ExecutionWorkflow(execution.id,nextRun || undefined);
    return Response.json({ executionId: execution.id, status: 200 });
}
