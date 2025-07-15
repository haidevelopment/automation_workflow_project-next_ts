"use client"
import { cn } from '@/lib/utils'
import { WorkflowExecutionStatus } from '@/types/workflow'
import React from 'react'

export default function ExecutionStatusIndicator({ status }: { status: string }) {
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
const LabelColors: Record<WorkflowExecutionStatus, string> = {
        PENDING: "text-slate-400",
        RUNNING: 'text-yellow-400',
        COMPLETED: 'text-emerald-600',
        FAILED: 'text-red-400'
    }

export function ExecutionStatusLabel({ status }: { status: string }) {
    const indicatorColor: Record<WorkflowExecutionStatus, string> = {
        PENDING: "bg-slate-400",
        RUNNING: 'bg-yellow-400',
        COMPLETED: 'bg-emerald-600',
        FAILED: 'bg-red-400'
    }
    return <span className={cn('lowercase',LabelColors[status as WorkflowExecutionStatus])}>{status}</span>
}