"use client"
import { cn } from '@/lib/utils'
import { WorkflowExecutionStatus } from '@/types/workflow'
import React from 'react'

function ExecutionStatusIndicator({ status }: { status: string }) {
    const indicatorColor: Record<WorkflowExecutionStatus, string> = {
        PENDING: "bg-slate-400",
        RUNNING: 'bg-yellow-400',
        COMPLETED: 'bg-emerald-600',
        FAILED: 'bg-red-400'
    }
    return (
        <div className={cn('w-2 h-2 rounded-full', indicatorColor[status as WorkflowExecutionStatus])}>

        </div>
    )
}

export default ExecutionStatusIndicator
