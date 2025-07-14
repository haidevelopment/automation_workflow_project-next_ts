import { GetWorkflowExecutions } from "@/actions/workflows/getWWorkflowExecutions";
import Topbar from "../../_components/topbar/Topbar";
import { Suspense } from "react";
import { InboxIcon, Loader2Icon } from "lucide-react";
import { waitFor } from "@/lib/helper/waitFor";
import ExecutionsTable from "./_components/ExecutionsTable";

export default function ExecutionsPage({ params }: { params: { workflowId: string } }) {
    return <div className="h-full w-full overflow-auto">
        <Topbar workflowId={params.workflowId} title="Workflow runs" hideButtons subTitle="List of all your workflow" />
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2Icon className="animate-spin stroke-primary" size={30} /></div>}>
            <ExecutionsTableWraper workflowId={params.workflowId} />
        </Suspense>
    </div>
}
async function ExecutionsTableWraper({ workflowId }: { workflowId: string }) {
    await waitFor(3000);
    const executions = await GetWorkflowExecutions(workflowId);
    if (!executions) {
        return <div className="text-center text-muted-foreground">No Data</div>
    }
    if (executions.length == 0) {
        return (
            <div className="container w-full py-6">
                <div className="flex  items-center flex-col gap-2 justify-center h-full w-full">
                    <div className="rounded-full bg-accent w-20 h-20 flex items-center justify-center">
                        <InboxIcon size={40} className="stroke-primary" />
                    </div>
                    <div className="flex flex-col gap-1 text-center">
                        <p className="font-bold">
                            No runs have been triggered yetv for this workflow
                        </p>
                        <div className="text-sm text-muted-foreground">
                            You can trigger a new run in the editor page
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="container w-full py-6">
            <ExecutionsTable workflowId={workflowId} initialData={executions} />
        </div>
    )
}