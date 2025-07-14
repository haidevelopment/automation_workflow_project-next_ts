"use client"
import { RunWorkflow } from '@/actions/workflows/runWorkflow'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { PlaneIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function RunBtn({workflowId}:{workflowId:string}) {
    const mutation = useMutation({
        mutationFn: RunWorkflow,
        onSuccess: () => {
            toast.success("Workflow executed",{id:workflowId});
        },
        onError: () => {
            toast.error("Something went wrong",{id:workflowId});
        }
    })
  return (
    <Button variant={"outline"} size={"sm"} className='flex items-center gap-2' disabled={mutation.isPending} onClick={() => {
        toast.loading("Running workflow...", {id:workflowId});
        mutation.mutate({workflowId});
    }}>
      <PlaneIcon size={16} className='stroke-white-400' /> Run
    </Button>
  )
}

export default RunBtn
