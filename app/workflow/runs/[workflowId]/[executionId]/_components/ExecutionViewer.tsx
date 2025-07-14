"use client"
import { GetWorkflowExecutionWithPhases } from '@/actions/workflows/getWorkflowExecutionWithPhases'
import { GetWorkflowPhaseDetails } from '@/actions/workflows/GetWorkflowPhaseDetails';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExecutionLog } from '@/lib/generated/prisma';
import { DatesToDurationString } from '@/lib/helper/dates';
import { GetPhasesTotalCost } from '@/lib/helper/phases';
import { cn } from '@/lib/utils';
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from '@/types/workflow';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, CircleDashedIcon, ClockIcon, Coins, CoinsIcon, Loader2Icon, LucideProps, WorkflowIcon } from 'lucide-react';
import React, { ReactNode, useEffect, useState } from 'react'
import PhaseStatusBadge from './PhaseStatusBadge';
import ReactCountUpWrapper from '@/components/ReactCountUpWrapper';
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

  useEffect(() => {
     const phases = query.data?.phases || [];
     if(isRunning){
      const phaseToSelect = phases.toSorted((a,b)=> a.startedAt! > b.startedAt! ? -1 : 1)[0];
      setSelectedPhase(phaseToSelect.id);
      return;
     }
      const phaseToSelect = phases.toSorted((a,b)=> a.completedAt! > b.completedAt! ? -1 : 1)[0];
      setSelectedPhase(phaseToSelect.id);
  },[query.data?.phases, isRunning, setSelectedPhase])
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
          <ExecutionLabel icon={CircleDashedIcon} label="Status" value={<div className="flex gap-2 font-semibold capitalize items-center">
            <PhaseStatusBadge status={query.data?.status as ExecutionPhaseStatus} />
            <span>{query?.data?.status}</span>
          </div>} />
          {/* Started at Label*/}
          <ExecutionLabel icon={CalendarIcon} label="Started At" value={<span className="lowercase">{query.data?.startedAt ? formatDistanceToNow(new Date(query.data?.startedAt), {
            addSuffix: true
          }) : "-"}</span>} />
          <ExecutionLabel icon={ClockIcon} label="Duration" value={duration ? duration : <Loader2Icon className="animate-spin" size={20} />} />
          <ExecutionLabel icon={CoinsIcon} label="Credit Consumed" value={<ReactCountUpWrapper value={creditsConsumed} />} />

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

              if (isRunning) return;
              setSelectedPhase(phase.id)
            }}>
              <div className="flex items-center gap-2">
                <Badge variant={"outline"}>{index + 1}</Badge>
                <p className="font-semibold">{phase.name}</p>
              </div>
              <PhaseStatusBadge status={phase.status as ExecutionPhaseStatus} />
            </Button>
          ))}
        </div>

      </aside>
      <div className="flex w-full h-full">
        {isRunning && (
          <div className="flex items-center flex-col gap-2 justify-center h-full w-full">
            <p className="font-bold">Tools đang khởi chạy , vui lòng chờ</p>
          </div>
        )}
        {!isRunning && !selectedPhase && (
          <div className="flex items-center flex-col gap-2 justify-center h-full w-full">
            <div className="flex text-center flex-col gap-1 ">
              <p className="font-bold">Không Phase nào được chọn</p>
              <p className="text-sm text-muted-foreground">Vui lòng chọn phase để xem chi tiết</p>
            </div>
          </div>
        )}
        {!isRunning && selectedPhase && phaseDetails.data && (
          <div className="flex flex-col py-4 container gap-4 overflow-auto">
            <div className="flex gap-2 items-center">
              <Badge variant={"outline"} className="space-x-4">
                <div className="flex gap-1 items-center">
                  <CoinsIcon size={20} className="stroke-muted-foreground/80" />
                  <span>Creadits</span>
                </div>
                <span>{phaseDetails.data.creditsConsumed}</span>
              </Badge>
              <Badge variant={"outline"} className="space-x-4">
                <div className="flex gap-1 items-center">
                  <ClockIcon size={20} className="stroke-muted-foreground/80" />
                  <span>Duration</span>
                </div>
                <span>{DatesToDurationString(phaseDetails.data.completedAt, phaseDetails.data.startedAt) || "-"}</span>
              </Badge>
            </div>
            <ParamaterViewer title="Inputs" subtitle="Inputs used in this phase" paramsJSON={phaseDetails.data.inputs} />
            <ParamaterViewer title="Outputs" subtitle="Outputs used in this phase" paramsJSON={phaseDetails.data.outputs} />
            <LogViewer logs={phaseDetails.data.logs} />

          </div>
        )}
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
function ParamaterViewer({ title, subtitle, paramsJSON }: { title: string, subtitle: string, paramsJSON: string | null }) {
  const params = paramsJSON ? JSON.parse(paramsJSON) : null;
  return <Card>
    <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background">
      <CardTitle className="text-base">{title}</CardTitle>
      <CardDescription className="text-muted-foreground text-sm">{subtitle}</CardDescription>
    </CardHeader>
    <CardContent className="py-4">
      <div className="flex flex-col gap-2">
        {!params || Object.keys(params).length == 0 && (
          <p className="text-muted-foreground text-sm">Không có parameter</p>
        )}
        {params && Object.entries(params).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center space-y-1">
            <p className="text-sm text-muted-foreground flex-1 basis-1/3 ">{key}</p>
            <Input readOnly value={value as string} className="flex-1 basis-2/3" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
}
function LogViewer({ logs }: { logs: ExecutionLog[] | undefined }) {
  if (!logs || logs.length == 0) {
    return <Card>
      <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background">
        <CardTitle className="text-base">Logs</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">Không có log</p>
        </div>
      </CardContent>
    </Card>
  }
  return <Card className="w-full">
      <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background">
      <CardTitle className="text-base">Logs</CardTitle>
      <CardDescription className="text-muted-foreground text-sm">Logs Generated by this phases</CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Time</TableHead>
            <TableHead className="w-1/4">Level</TableHead>
            <TableHead className="w-3/4">Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="text-muted-foreground">
              <TableCell className="w-1/4">{log.time.toISOString()}</TableCell>
              <TableCell className={cn("w-1/4 uppercase font-bold p-[3px] pl-4", log.logLevel == "error" ? "text-destructive" : "text-primary")}>{log.logLevel}</TableCell>
              <TableCell className="w-3/4">{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
}