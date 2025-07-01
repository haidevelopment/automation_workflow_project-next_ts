"use client"
import { GetWorkflowExecutionWithPhases } from '@/actions/workflows/getWorkflowExecutionWithPhases'
import { GetWorkflowPhaseDetails } from '@/actions/workflows/GetWorkflowPhaseDetails';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatesToDurationString } from '@/lib/helper/dates';
import { GetPhasesTotalCost } from '@/lib/helper/phases';
import { WorkflowExecutionStatus } from '@/types/workflow';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, CircleDashedIcon, ClockIcon, CoinsIcon, Loader2Icon, LucideProps, WorkflowIcon } from 'lucide-react';
import React, { ReactNode, useState } from 'react'
type ExecutionData = Awaited<ReturnType<typeof GetWorkflowExecutionWithPhases>>;

function ExecutionViewer({ initialData }: { initialData: ExecutionData }) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["execution", initialData?.id],
    initialData,
    queryFn: () => GetWorkflowExecutionWithPhases(initialData!.id),
    refetchInterval: (q) => q.state.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false
  })
  const isRunning = query.data?.status === WorkflowExecutionStatus.RUNNING;
  const phaseDetails = useQuery({
    queryKey: ["phaseDetails", selectedPhase],
    enabled: !!selectedPhase,
    queryFn: () => GetWorkflowPhaseDetails(selectedPhase!),
  })
  const duration = DatesToDurationString(query.data?.completedAt, query.data?.startedAt)
  const creditsConsumed = GetPhasesTotalCost(query.data?.phases || []);
  return (
    <div className='flex h-full w-full'>
      <aside className='w-[400px] min-w-[440px] max-w-[440px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden'>

        <div className="py-4 px-2">
          {/* Status Label*/}
          <ExecutionLabel icon={CircleDashedIcon} label="Status" value={query.data?.status} />
          {/* Started at Label*/}
          <ExecutionLabel icon={CalendarIcon} label="Started At" value={<span className="lowercase">{query.data?.startedAt ? formatDistanceToNow(new Date(query.data?.startedAt), {
            addSuffix: true
          }) : "-"}</span>} />
          <ExecutionLabel icon={ClockIcon} label="Duration" value={duration ? duration : <Loader2Icon className="animate-spin" size={20} />} />
          <ExecutionLabel icon={CoinsIcon} label="Credit Consume" value={creditsConsumed} />

        </div>
        <Separator />
        <div className="flex justify-center items-center py-2 px-4 ">
          <div className="text-muted-foreground flex items-center gap-2">
            <WorkflowIcon size={20} className="stroke-muted-foreground/80" />
            <span className="font-semibold">Phases</span>
          </div>
        </div>
        <Separator />
        <div className="overflow-auto h-full px-2 py-4">
          {query.data?.phases.map((phase, index) => (
            <Button className="w-full justify-between" variant={selectedPhase === phase?.id ? 'destructive' : 'ghost'} key={phase.id} onClick={() => {
              
              if(isRunning) return;
              setSelectedPhase(phase.id)
              
              
              
              }}>
              <div className="flex items-center gap-2">
                <Badge variant={"outline"}>{index + 1}</Badge>
                <p className="font-semibold">{phase.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{phase.status}</p>
            </Button>
          ))}
        </div>

      </aside>
      <div className="flex w-full h-full">
        <pre>{JSON.stringify(phaseDetails.data, null, 2)}</pre>
      </div>
    </div>
  )
}

export default ExecutionViewer
function ExecutionLabel({ icon, label, value }: { icon: React.FC<LucideProps>, label: ReactNode, value: ReactNode }) {
  const Icon = icon;
  return <div className="flex justify-between items-center py-2 px-4 text-sm">
    <div className="text-muted-foreground flex items-center gap-2">
      <Icon size={20} className="stroke-muted-foreground/80" />
      <span>{label}</span>
    </div>
    <div className="font-semibold capitalize flex gap-2 items-center">
      {value}
    </div>
  </div>
}