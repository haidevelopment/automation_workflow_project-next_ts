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
import { AppNode } from '@/types/appNode';
import { TaskType } from '@/types/task';
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from '@/types/workflow';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, CircleDashedIcon, ClockIcon, Coins, CoinsIcon, Loader2Icon, LucideProps, WorkflowIcon } from 'lucide-react';
import React, { ReactNode, useEffect, useState } from 'react'
import PhaseStatusBadge from './PhaseStatusBadge';
import ReactCountUpWrapper from '@/components/ReactCountUpWrapper';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";
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
      <div className="flex w-full h-full min-w-0 overflow-x-hidden">
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
          <div className="flex flex-col py-4 px-4 gap-4 overflow-y-auto overflow-x-hidden w-full min-w-0">
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
            <PhaseDetailsRenderer phaseDetails={phaseDetails.data} />
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

function PhaseDetailsRenderer({ phaseDetails }: { phaseDetails: any }) {
  let node: AppNode | null = null;
  try {
    node = phaseDetails?.node ? (JSON.parse(phaseDetails.node) as AppNode) : null;
  } catch {
    node = null;
  }
  const taskType = node?.data?.type as TaskType | undefined;
  if (taskType === TaskType.EXPORT) {
    const inputs = phaseDetails.inputs ? (JSON.parse(phaseDetails.inputs) as Record<string, any>) : {};
    const outputs = phaseDetails.outputs ? (JSON.parse(phaseDetails.outputs) as Record<string, any>) : {};
    const exportType = String(inputs["Export Type"] ?? "");
    const exportResultRaw = String(outputs["Export Result"] ?? "");
    let exportResult: any = null;
    try {
      exportResult = exportResultRaw ? JSON.parse(exportResultRaw) : null;
    } catch {
      exportResult = null;
    }

    const googleUrl = exportResult?.kind === "google" ? String(exportResult?.url ?? "") : "";
    const downloadUrl = exportResult?.kind === "local" ? String(exportResult?.downloadUrl ?? "") : "";

    return (
      <>
        <Card>
          <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">Inputs used in this phase</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center space-y-1">
                <p className="text-sm text-muted-foreground flex-1 basis-1/3 ">Export Type</p>
                <Input readOnly value={exportType} className="flex-1 basis-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background">
            <CardTitle className="text-base">Outputs</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">Outputs used in this phase</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-3">
              {googleUrl && (
                <Button
                  type="button"
                  variant={"outline"}
                  className="bg-zinc-950 text-zinc-100 border-zinc-800 hover:bg-zinc-900"
                  onClick={() => window.open(googleUrl, "_blank", "noopener,noreferrer")}
                >
                  Open
                </Button>
              )}

              {downloadUrl && (
                <LocalExportPreview downloadUrl={downloadUrl} exportType={exportType} />
              )}
              <OutputBox label="Export Result" value={exportResultRaw} />
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
  if (taskType !== TaskType.AI) {
    return (
      <>
        <ParamaterViewer title="Inputs" subtitle="Inputs used in this phase" paramsJSON={phaseDetails.inputs} />
        <ParamaterViewer title="Outputs" subtitle="Outputs used in this phase" paramsJSON={phaseDetails.outputs} />
      </>
    );
  }

  const inputs = phaseDetails.inputs ? (JSON.parse(phaseDetails.inputs) as Record<string, any>) : {};
  const outputs = phaseDetails.outputs ? (JSON.parse(phaseDetails.outputs) as Record<string, any>) : {};

  const systemPrompt = inputs["System Prompt"] ?? "";
  const userRequirement = inputs["User Requirement"] ?? "";
  const inputData = inputs["Input"] ?? "";
  const aiResponse = outputs["Output"] ?? "";
  const provider = inputs["Provider"] ?? "";
  const model = inputs["Model"] ?? "";

  return (
    <>
      <Card>
        <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background">
          <CardTitle className="text-base">Inputs</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">Inputs used in this AI phase</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {provider && (
                <Badge variant={"secondary"} className="bg-zinc-900 text-zinc-100 border border-zinc-800">
                  Provider: {provider}
                </Badge>
              )}
              {model && (
                <Badge variant={"secondary"} className="bg-zinc-900 text-zinc-100 border border-zinc-800">
                  Model: {model}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">System Prompt</p>
              <CollapsibleText value={systemPrompt} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">User Requirement</p>
              <CollapsibleText value={userRequirement || "-"} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Input Data</p>
              <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap max-h-[280px] overflow-auto">{inputData}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background">
          <CardTitle className="text-base">Outputs</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">Outputs generated by this AI phase</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <OutputBox label="AI Response" value={String(aiResponse || "")} />
        </CardContent>
      </Card>
    </>
  );
}

function isValidJsonString(value: string) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return false;
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

function OutputBox({ label, value }: { label: string; value: string }) {
  const [mode, setMode] = useState<"markdown" | "json">("markdown");
  const canFormatJson = isValidJsonString(value);
  const jsonData = canFormatJson ? (JSON.parse(value.trim()) as unknown) : null;

  return (
    <div className="space-y-2 w-full max-w-full min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          {canFormatJson && (
            <Button
              type="button"
              variant={"outline"}
              size={"sm"}
              className="h-8 bg-zinc-950 text-zinc-100 border-zinc-800 hover:bg-zinc-900"
              onClick={() => setMode((m) => (m === "json" ? "markdown" : "json"))}
            >
              {mode === "json" ? "Raw" : "Format JSON"}
            </Button>
          )}
          <Button
            type="button"
            variant={"outline"}
            size={"sm"}
            className="h-8 bg-zinc-950 text-zinc-100 border-zinc-800 hover:bg-zinc-900"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(value);
                toast.success("Copied");
              } catch {
                toast.error("Copy failed");
              }
            }}
          >
            Copy
          </Button>
        </div>
      </div>
      <div className="rounded-md border border-zinc-800 bg-zinc-950 text-zinc-100 p-4 text-sm overflow-x-auto overflow-y-auto shadow-sm w-full max-w-full min-w-0">
        {mode === "json" && canFormatJson ? (
          <JsonTree data={jsonData} />
        ) : (
          <div className="prose prose-invert max-w-none break-words [&_*]:break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function JsonTree({ data, level = 0 }: { data: any; level?: number }) {
  const indent = { paddingLeft: `${level * 16}px` };
  if (data === null) {
    return <div style={indent} className="text-zinc-300">null</div>;
  }
  if (Array.isArray(data)) {
    return (
      <div style={indent}>
        <div className="text-zinc-400">[</div>
        {data.map((item, idx) => (
          <div key={idx} className="flex">
            <div className="text-zinc-500" style={{ paddingLeft: `${(level + 1) * 16}px` }}>
              {idx}:
            </div>
            <div className="flex-1">
              <JsonTree data={item} level={level + 1} />
            </div>
          </div>
        ))}
        <div className="text-zinc-400">]</div>
      </div>
    );
  }
  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, any>);
    return (
      <div style={indent}>
        <div className="text-zinc-400">{'{'}</div>
        {entries.map(([k, v]) => (
          <div key={k} className="flex" style={{ paddingLeft: `${(level + 1) * 16}px` }}>
            <div className="text-violet-300 min-w-[160px] break-all">{k}:</div>
            <div className="flex-1">
              <JsonTree data={v} level={level + 1} />
            </div>
          </div>
        ))}
        <div className="text-zinc-400">{'}'}</div>
      </div>
    );
  }

  if (typeof data === "string") {
    return <div style={indent} className="text-emerald-300 break-words">"{data}"</div>;
  }
  if (typeof data === "number") {
    return <div style={indent} className="text-sky-300">{data}</div>;
  }
  if (typeof data === "boolean") {
    return <div style={indent} className="text-amber-300">{String(data)}</div>;
  }
  return <div style={indent} className="text-zinc-200 break-words">{String(data)}</div>;
}

function CollapsibleText({ value }: { value: string }) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = value.length > 220;
  const displayValue = expanded || !canCollapse ? value : `${value.slice(0, 220)}...`;
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3 text-sm whitespace-pre-wrap text-zinc-100 shadow-sm">
      <div>{displayValue}</div>
      {canCollapse && (
        <div className="pt-2">
          <Button
            type="button"
            variant={"outline"}
            size={"sm"}
            className="h-8 bg-zinc-950 text-zinc-100 border-zinc-800 hover:bg-zinc-900"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      )}
    </div>
  );
}

function LocalExportPreview({
  downloadUrl,
  exportType,
}: {
  downloadUrl: string;
  exportType: string;
}) {
  const localExt = exportType === "Excel" ? "xlsx" : exportType === "Word" ? "docx" : "";
  const [previewError, setPreviewError] = useState<string>("");
  const [xlsxHtml, setXlsxHtml] = useState<string>("");
  const docxContainerRef = React.useRef<HTMLDivElement | null>(null);
  const docxStyleContainerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      setPreviewError("");
      setXlsxHtml("");

      if (!downloadUrl) return;

      try {
        const res = await fetch(downloadUrl);
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `Preview fetch failed (${res.status})`);
        }

        const arrayBuffer = await res.arrayBuffer();
        if (cancelled) return;

        if (localExt === "docx") {
          const el = docxContainerRef.current;
          const styleEl = docxStyleContainerRef.current;
          if (!el) return;
          el.innerHTML = "";
          if (styleEl) styleEl.innerHTML = "";
          await renderAsync(arrayBuffer, el, styleEl ?? undefined, {
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
          });
          return;
        }

        if (localExt === "xlsx") {
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const firstSheetName = workbook.SheetNames?.[0];
          if (!firstSheetName) throw new Error("No sheets found");
          const sheet = workbook.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(sheet);
          setXlsxHtml(html);
          return;
        }
      } catch (e: any) {
        setPreviewError(e?.message ?? String(e));
      }
    }

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [downloadUrl, localExt]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-muted-foreground">Preview</p>
        <Button
          type="button"
          variant={"outline"}
          className="bg-zinc-950 text-zinc-100 border-zinc-800 hover:bg-zinc-900"
          onClick={() => window.open(downloadUrl, "_blank", "noopener,noreferrer")}
        >
          Download
        </Button>
      </div>

      {previewError ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-200 whitespace-pre-wrap">
          {previewError}
        </div>
      ) : localExt === "docx" ? (
        <div className="w-full rounded-md border border-zinc-800 bg-zinc-200/60 p-4 max-h-[520px] overflow-auto">
          <div className="mx-auto w-full max-w-[880px] bg-white shadow-sm rounded-sm p-8">
            <div ref={docxStyleContainerRef} />
            <div ref={docxContainerRef} />
          </div>
        </div>
      ) : localExt === "xlsx" ? (
        <div className="w-full rounded-md border border-zinc-800 bg-white p-3 max-h-[520px] overflow-auto">
          <div
            className="text-sm [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:p-2 [&_th]:p-2"
            dangerouslySetInnerHTML={{ __html: xlsxHtml || "" }}
          />
        </div>
      ) : (
        <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-200">
          Preview is not available for this file.
        </div>
      )}
    </div>
  );
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