import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionWithPhases";
import Topbar from "@/app/workflow/_components/topbar/Topbar";
import { waitFor } from "@/lib/helper/waitFor";
import { auth } from "@clerk/nextjs/server";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import ExecutionViewer from "./_components/ExecutionViewer";

export default function ExecutionViewerPage({params}:{params:{workflowId:string,executionId:string}}) {
    return <div className='flex flex-col h-screen w-full overflow-hidden'>
     <Topbar workflowId={params.workflowId} title="Workflow run details" subTitle={`Run ID: ${params.executionId}`} hideButtons={true} />
     <section className="flex h-full overflow-auto">
        <Suspense fallback={<div className='flex w-full items-center justify-center'><Loader2Icon size={30} className='h-10 w-10 animate-spin stroke-primary' /></div>}>
            <ExecutionViewerWrapper executionId={params.executionId} workflowId={params.workflowId} />
        </Suspense>
     </section>
    </div>
}
async function ExecutionViewerWrapper({executionId,workflowId}:{executionId:string,workflowId:string}) {
    const {userId} = await auth();
    if(!userId) {
        throw new Error("unauthenticated")
    }
    const workflowExecution = await GetWorkflowExecutionWithPhases(executionId);
    if(!workflowExecution) {
        return <div>Not found</div>;
    }
    return <ExecutionViewer initialData={workflowExecution} />
}