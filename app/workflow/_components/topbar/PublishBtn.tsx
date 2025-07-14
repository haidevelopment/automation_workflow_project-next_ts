"use client"
import { PublishWorkflow } from '@/actions/workflows/PublishWorkflow'
import { RunWorkflow } from '@/actions/workflows/runWorkflow'
import useExecutionPlan from '@/components/hooks/useExecutionPlan'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useReactFlow } from '@xyflow/react'
import { UploadCloudIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export default function PublishBtn({workflowId}:{workflowId:string}) {
  const generate = useExecutionPlan();
  const {toObject}= useReactFlow();
   const mutation = useMutation({ 
    mutationFn:PublishWorkflow,
    onSuccess: () => {
      toast.success("Workflow published",{id:workflowId});
    },
    onError: () => {
      toast.error("Something went wrong",{id:workflowId});
    } 
   })
  return (
    <Button variant={"outline"} className='flex items-center gap-2' disabled={mutation.isPending  } onClick={()=>{
      const plan = generate();
      console.log("____plan____");
      console.table(plan);
      if(!plan) {
        //validation
        return;
      }
      toast.loading("Publishing workflow...", {id:workflowId});
      mutation.mutate({
        id:workflowId,
        flowDefinition:JSON.stringify(toObject()),
      });
    }}>
      <UploadCloudIcon size={16} className='stroke-green-400' /> Publish
    </Button>
  )
}
