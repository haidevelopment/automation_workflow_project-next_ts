"use client"
import { UnPublishWorkflow } from '@/actions/workflows/UnPublishWorkflow'
import useExecutionPlan from '@/components/hooks/useExecutionPlan'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useReactFlow } from '@xyflow/react'
import { DownloadCloudIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export default function UnPublishBtn({workflowId}:{workflowId:string}) {
  const generate = useExecutionPlan();
  const {toObject}= useReactFlow();
   const mutation = useMutation({ 
    mutationFn:UnPublishWorkflow,
    onSuccess: () => {
      toast.success("Workflow unpublished",{id:workflowId});
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
      toast.loading("Un Publishing workflow...", {id:workflowId});
      mutation.mutate({
        id:workflowId,
        flowDefinition:JSON.stringify(toObject()),
      });
    }}>
      <DownloadCloudIcon size={16} className='stroke-green-400' /> UnPublish
    </Button>
  )
}
