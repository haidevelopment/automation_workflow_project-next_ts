import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { waitFor } from "@/lib/helper/waitFor";
import { getWorkflowsForUser } from "@/actions/workflows/getWorkflowsForUser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, InboxIcon } from "lucide-react";
import CreateWorkflowDialog from "./_components/CreateWorkflowDialog";
import WorkflowCard from "./_components/WorkflowCard";

function page() {
  return (
    <div className="flex-1 flex flex-col h-full ">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Manage your workflows</p>
        </div>
        <CreateWorkflowDialog />
      </div>
      <div className="h-full py-6">
        <Suspense fallback={<UserWorkflowsSkeleton />}>
          <UserWorkflows />
        </Suspense>
      </div>
    </div>
  );
}
function UserWorkflowsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
async function UserWorkflows() {
  const workflow = await getWorkflowsForUser();

  try {
    if(workflow.length === 0) {
        return <div className="flex flex-col h-full items-center justify-center">
            <div className="rounded-full bg-accent w-20 h-20 flex items-center justify-center">
                <InboxIcon size={40} className="stroke-primary" />
            </div>
            <div className="flex flex-col gap-1 text-center">
                <p className="font-bold">No Workflow Created Yet</p>
                <p className="text-sm text-muted-foreground mb-2">Click the button below to create your first Workflow</p>
            </div>
            <CreateWorkflowDialog tringgerText="Create your first workflows" />
        </div>
    }
  } catch (error) {
    return (
        <Alert variant={"destructive"}>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Something went wrong. Please try again laters
          </AlertDescription>
        </Alert>
      );
  }
  return <div className="grid grid-cols-1 gap-4">
    {
      workflow.map((w,index) => (
        <WorkflowCard key={index} workflow={w} />
      ))
    }
  </div>;
}
export default page;
