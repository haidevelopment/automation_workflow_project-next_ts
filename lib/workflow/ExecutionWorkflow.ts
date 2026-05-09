import "server-only";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/types/workflow";
import { waitFor } from "../helper/waitFor";
import { ExecutionPhase } from "../generated/prisma";
import { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";
import { TaskParamType, TaskType } from "@/types/task";
import { ExecutorRegistry } from "./executor/registry";
import { Environment, ExecutionEnvironment } from "@/types/executor";
import { Browser, Page } from "puppeteer";
import { Edge } from "@xyflow/react";
import { LogCollector } from "@/types/log";
import { createLogCollector } from "../log";
export async function ExecutionWorkflow(executionId: string, nextRunAt?: string) {
    const execution = await prisma.workflowExecution.findUnique({
        where: {
            id: executionId
        },
        include: {
            workflow: true,
            phases: true
        }
    })
    if (!execution) {
        throw new Error("Execution not found")
    }
    const edges = JSON.parse(execution.definition).edges as Edge[];
    //TODO :setup execution enviroment

    const environment: Environment = {
        phases: {

        }
    }
    await initializeWorkflowExecution(executionId, execution.workflowId, nextRunAt);
    await initializePhaseStatuses(execution);
    //todo : initialize phases status
    let creditsConsumed = 0;
    let executionFailed = false;
    for (const phase of execution.phases) {
        //TODO : execution pharse

        const phaseExecution = await executionWorkflowPhase(phase, environment, edges, execution.userId);
        creditsConsumed += phaseExecution.creditsConsumed;
        if (!phaseExecution.success) {
            executionFailed = true;
            break;
        }
    }
    await finalizeWorkflowExecution(executionId, execution.workflowId, executionFailed, creditsConsumed);
    await cleanupEnvironment(environment);
    revalidatePath(`/workflow/runs`);
    return execution
}
async function initializeWorkflowExecution(executionId: string, workflowId: string,nextRunAt?: string) {
    await prisma.workflowExecution.update({
        where: {
            id: executionId
        },
        data: {
            startedAt: new Date(),
            status: WorkflowExecutionStatus.RUNNING
        }
    })
    await prisma.workflow.update({
        where: {
            id: workflowId
        },
        data: {
            lastRunAt: new Date(),
            lastRunId: executionId,
            lastRunStatus: WorkflowExecutionStatus.RUNNING,
            ...(nextRunAt && { nextRunAt })
            // status: WorkflowExecutionStatus.RUNNING
        }
    })
}
async function initializePhaseStatuses(execution: any) {
    await prisma.executionPhase.updateMany({
        where: {
            id: {
                in: execution.phases.map((phase: any) => phase.id)
            }
        },
        data: {
            status: ExecutionPhaseStatus.PENDING
        }
    })
}
async function finalizeWorkflowExecution(executionId: string, workflowId: string, executionFailed: boolean, creditsConsumed: number) {
    const finalStatus = executionFailed ? WorkflowExecutionStatus.FAILED : WorkflowExecutionStatus.COMPLETED;
    await prisma.workflowExecution.update({
        where: {
            id: executionId
        },
        data: {
            completedAt: new Date(),
            status: finalStatus,
            creditsConsumed
        }
    });
    await prisma.workflow.update({
        where: {
            id: workflowId,
            lastRunId: executionId
        },
        data: {
            // lastRunAt: new Date(),
            // lastRunId: executionId,
            lastRunStatus: finalStatus,
            // status: WorkflowExecutionStatus.RUNNING
        }
    }).catch((err) => {
        //error
        console.log(err);
    });

}
async function executionWorkflowPhase(phase: ExecutionPhase, environment?: Environment, edges: Edge[] = [], userId?: string) {
    const startedAt = new Date();
    const node = JSON.parse(phase.node) as AppNode;
    const logCollector = createLogCollector();
    setupEnvironmentForPhase(node, environment, edges);
    //Update Phase Status
    await prisma.executionPhase.update({
        where: {
            id: phase.id
        },
        data: {
            status: ExecutionPhaseStatus.RUNNING,
            startedAt,
            inputs: JSON.stringify(environment?.phases[node.id]?.inputs)
        }
    });
    //TODO : execute phase
    const creditsRequired = TaskRegistry[node.data?.type].credits;

    let success = await decrementCredits(userId!, creditsRequired, logCollector);
    const creditsConsumed = success ? creditsRequired : 0;

    // TODO : decrement user balance ( with required credits)
    if(success){
         success = await executePhase(phase, node, environment, logCollector);
    }
    //Execution phase simulation
    const outputs = environment?.phases[node.id]?.outputs;
    await finalizePhase(phase.id, success, outputs, logCollector, creditsConsumed);
    return { success, creditsConsumed };

}
async function finalizePhase(phaseId: string, success: boolean, outputs?: any, logCollector?: LogCollector, creditsConsumed?: number) {
    const finalStatus = success ? ExecutionPhaseStatus.COMPLETED : ExecutionPhaseStatus.FAILED;
    await prisma.executionPhase.update({
        where: {
            id: phaseId
        },
        data: {
            status: finalStatus,
            completedAt: new Date(),
            outputs: JSON.stringify(outputs),
            creditsConsumed,
            logs: {
                createMany: {
                    data: logCollector?.getAll().map((log) => ({
                        message: log.message,
                        time: log.timestamp,
                        logLevel: log.level,
                    })) ?? []
                }
            }
        }
    })
}
async function executePhase(phase: ExecutionPhase, node: AppNode, environment?: Environment, logCollector?: LogCollector): Promise<boolean> {
    const runFn = ExecutorRegistry[node.data.type];
    if (!runFn || !environment) {
        return false;
    }
    const executionEnvironment = createExecutionEnvironment(node, environment, logCollector!, phase.userId);
    return await runFn(executionEnvironment);
}
function setupEnvironmentForPhase(node: AppNode, environment?: Environment, edges?: Edge[]) {
    //TODO : setup environment for phase
    if (environment) {
        environment.phases[node.id] = { inputs: {}, outputs: {} };
        const inputs = TaskRegistry[node.data.type].inputs;
        for (const input of inputs) {
            if (input.type == TaskParamType.BROWSER_INSTANCE) continue;
            const inputValue = node.data.inputs[input.name];
            if (inputValue) {
                environment.phases[node.id].inputs[input.name] = inputValue;
                continue;
            }

            const connectedEdge = edges?.find((edge) => edge.target == node.id && edge.targetHandle == input.name);
            if (!connectedEdge) {
                console.error('Missing edges for input', input.name)
                continue;
            }
            const outputValue = environment.phases[connectedEdge.source].outputs[connectedEdge.sourceHandle!];
            environment.phases[node.id].inputs[input.name] = outputValue;

        }

    }

}
function createExecutionEnvironment(node: AppNode, environment: Environment, logCollector: LogCollector, userId?: string): ExecutionEnvironment<any> {
    return {
        getInput: (name: string) => environment.phases[node.id].inputs[name],
        setOutput: (name: string, value: string) => {
            environment.phases[node.id].outputs[name] = value
        },
        getUserId: () => userId,
        getBrowser: () => environment.browser,
        setBrowser: (browser: Browser) => {
            environment.browser = browser
        },

        getPage: () => environment.page,
        setPage: (page: Page) => {
            environment.page = page
        },
        log: logCollector


    }
}
async function cleanupEnvironment(environment: Environment) {
    if (environment.browser) {
        await environment.browser.close().catch((err) => console.log(err));

    }
}
async function decrementCredits(userId: string, amount: number, logCollector: LogCollector) {
    try {
        await prisma.userBalance.update({
            where: {
                userId, credits: { gte: amount }
            },
            data: {
                credits: {
                    decrement: amount
                }
            }
        });
        return true;
    } catch (error) {
        console.log(error);
        logCollector.error("Failed to decrement user balance");
        return false;
    }
}