import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import NodeCard from "./NodeCard";
import NodeHeader from "./NodeHeader";
import { AppNodeData } from "@/types/appNode";
import { NodeInput, NodeInputs } from "./NodeInputs";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { NodeOutput, NodeOutputs } from "./NodeOutputs";
import { Badge } from "@/components/ui/badge";
import { TaskType } from "@/types/task";
import { useEdges, useReactFlow } from "@xyflow/react";
import { AppNode } from "@/types/appNode";
import { useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TooltipWrapper from "@/components/TooltipWrapper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLinkIcon } from "lucide-react";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
const NodeComponent = memo((props: NodeProps) => {
  const nodeData = props.data as AppNodeData;
  const task = TaskRegistry[nodeData.type];
  const { getNode, updateNodeData } = useReactFlow();
  const edges = useEdges();
  const node = getNode(props.id) as AppNode | undefined;

  const aiProvider = node?.data?.inputs?.["Provider"] ?? "";
  const aiModel = node?.data?.inputs?.["Model"] ?? "";

  const aiSystemPromptParam = useMemo(() => {
    if (nodeData.type !== TaskType.AI) return undefined;
    return task.inputs.find((i) => i.name === "System Prompt");
  }, [nodeData.type, task.inputs]);

  useEffect(() => {
    if (nodeData.type !== TaskType.AI) return;
    if (!aiSystemPromptParam?.defaultValue) return;
    const current = node?.data?.inputs?.["System Prompt"];
    if (current && String(current).length > 0) return;
    updateNodeData(props.id, {
      inputs: {
        ...node?.data.inputs,
        "System Prompt": aiSystemPromptParam.defaultValue as string,
      },
    });
  }, [nodeData.type, aiSystemPromptParam?.defaultValue, node?.data.inputs, props.id, updateNodeData]);

  const inputList = useMemo(() => {
    if (nodeData.type !== TaskType.AI) return task.inputs;

    const providerParam = task.inputs.find((i) => i.name === "Provider");
    const modelParam = task.inputs.find((i) => i.name === "Model");
    const credentialsParam = task.inputs.find((i) => i.name === "Credentials");
    const userReqParam = task.inputs.find((i) => i.name === "User Requirement");
    const systemPromptParam = task.inputs.find((i) => i.name === "System Prompt");

    const list = [] as typeof task.inputs;
    if (providerParam) list.push(providerParam);
    if (aiProvider) {
      if (modelParam) list.push({ ...modelParam, className: "animate-in fade-in duration-200" } as any);
      if (credentialsParam) list.push({ ...credentialsParam, className: "animate-in fade-in duration-200" } as any);
    }
    if (aiProvider && aiModel) {
      if (userReqParam) list.push({ ...userReqParam, className: "animate-in fade-in duration-200" } as any);
      if (systemPromptParam) list.push(systemPromptParam);
    }
    return list;
  }, [aiModel, aiProvider, nodeData.type, task.inputs]);

  const exportProfile = useMemo(() => {
    if (nodeData.type !== TaskType.EXPORT) return "";
    const input = node?.data?.inputs?.["Input"];
    if (!input) return "";
    const trimmed = String(input).trim();
    if (!trimmed) return "";
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return "array";
      if (parsed && typeof parsed === "object") return "object";
      if (typeof parsed === "string") return "string";
      return typeof parsed;
    } catch {
      return "string";
    }
  }, [node?.data?.inputs, nodeData.type]);

  const exportSuggestedTypes = useMemo(() => {
    if (nodeData.type !== TaskType.EXPORT) return [] as string[];
    if (exportProfile === "array") return ["Excel", "Google Sheets"];
    if (exportProfile === "string") return ["Word", "Google Docs"];
    if (exportProfile === "object") return ["Excel", "Google Sheets", "Word", "Google Docs"];
    return [] as string[];
  }, [exportProfile, nodeData.type]);

  const exportJsonKeys = useMemo(() => {
    if (nodeData.type !== TaskType.EXPORT) return [] as string[];
    const input = node?.data?.inputs?.["Input"];
    const trimmed = String(input ?? "").trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const first = parsed[0];
        if (first && typeof first === "object" && !Array.isArray(first)) {
          return Object.keys(first);
        }
        return [];
      }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.keys(parsed);
      }
      return [];
    } catch {
      return [];
    }
  }, [node?.data?.inputs, nodeData.type]);

  const exportMappings = useMemo(() => {
    if (nodeData.type !== TaskType.EXPORT) return [] as Array<{ column: string; value: string }>;
    const raw = node?.data?.inputs?.["Field Mapping"];
    const text = String(raw ?? "[]");
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((r: any) => ({ column: String(r?.column ?? ""), value: String(r?.value ?? "") }))
        .filter((r: any) => r.column !== "" || r.value !== "");
    } catch {
      return [];
    }
  }, [node?.data?.inputs, nodeData.type]);

  const setExportMappings = (next: Array<{ column: string; value: string }>) => {
    updateNodeData(props.id, {
      inputs: {
        ...node?.data.inputs,
        "Field Mapping": JSON.stringify(next),
      },
    });
  };

  const fileName = String(node?.data?.inputs?.["File Name"] ?? "");
  const setFileName = (v: string) => {
    updateNodeData(props.id, {
      inputs: {
        ...node?.data.inputs,
        "File Name": v,
      },
    });
  };

  const exportTypeValue = String(node?.data?.inputs?.["Export Type"] ?? "");
  const setExportTypeValue = (v: string) => {
    updateNodeData(props.id, {
      inputs: {
        ...node?.data.inputs,
        "Export Type": v,
      },
    });
  };

  useEffect(() => {
    if (nodeData.type !== TaskType.EXPORT) return;
    if (exportTypeValue) return;
    const suggested = exportSuggestedTypes[0];
    if (!suggested) return;
    setExportTypeValue(suggested);
  }, [exportSuggestedTypes, exportTypeValue, nodeData.type]);

  useEffect(() => {
    if (nodeData.type !== TaskType.EXPORT) return;
    const current = String(node?.data?.inputs?.["Data Source Profile"] ?? "");
    if (current === exportProfile) return;
    updateNodeData(props.id, {
      inputs: {
        ...node?.data.inputs,
        "Data Source Profile": exportProfile,
      },
    });
  }, [exportProfile, node?.data.inputs, nodeData.type, props.id, updateNodeData]);

  const exportInputRaw = String(node?.data?.inputs?.["Input"] ?? "");
  const exportPreviewLines = useMemo(() => {
    if (nodeData.type !== TaskType.EXPORT) return [] as string[];
    const trimmed = exportInputRaw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 3).map((r) => JSON.stringify(r));
      }
      if (parsed && typeof parsed === "object") {
        return [JSON.stringify(parsed)].slice(0, 3);
      }
      return [String(parsed)].slice(0, 3);
    } catch {
      return trimmed.split(/\r?\n/).slice(0, 3);
    }
  }, [exportInputRaw, nodeData.type]);

  const exportHasIncoming = useMemo(() => {
    if (nodeData.type !== TaskType.EXPORT) return false;
    return edges.some((e) => e.target === props.id && e.targetHandle === "Input");
  }, [edges, nodeData.type, props.id]);

  const exportIsHtmlLike = useMemo(() => {
    if (nodeData.type !== TaskType.EXPORT) return false;
    const t = exportInputRaw.trim();
    if (!t) return false;
    if (t.startsWith("<!DOCTYPE")) return true;
    if (t.startsWith("<html")) return true;
    return /<\w+[^>]*>/.test(t);
  }, [exportInputRaw, nodeData.type]);

  const exportExcelHint = useMemo(() => {
    if (nodeData.type !== TaskType.EXPORT) return "";
    const isExcelLike = exportTypeValue === "Excel" || exportTypeValue === "Google Sheets";
    if (!isExcelLike) return "";
    if (exportProfile !== "string" && !exportIsHtmlLike) return "";
    const len = exportInputRaw.trim().length;
    if (len < 200) return "";
    return "Dữ liệu dạng văn bản sẽ được lưu vào một ô duy nhất trong Excel";
  }, [exportInputRaw, exportIsHtmlLike, exportProfile, exportTypeValue, nodeData.type]);

  const autoDetectFields = () => {
    if (nodeData.type !== TaskType.EXPORT) return;
    if (exportJsonKeys.length === 0) return;
    const next = exportJsonKeys.map((k) => ({ column: k, value: k }));
    setExportMappings(next);
  };

  const isGoogleExport =
    nodeData.type === TaskType.EXPORT &&
    (exportTypeValue === "Google Docs" || exportTypeValue === "Google Sheets");

  const isLocalFileExport =
    nodeData.type === TaskType.EXPORT &&
    (exportTypeValue === "Word" || exportTypeValue === "Excel");
  const googleAccount = String(node?.data?.inputs?.["Google Account"] ?? "").trim();
  const isGoogleConnected = isGoogleExport && googleAccount.length > 0;

  const docId = String(node?.data?.inputs?.["Document ID"] ?? "").trim();
  const setDocId = (v: string) => {
    updateNodeData(props.id, {
      inputs: {
        ...node?.data.inputs,
        "Document ID": v,
      },
    });
  };

  const spreadsheetId = String(node?.data?.inputs?.["Spreadsheet ID"] ?? "").trim();
  const setSpreadsheetId = (v: string) => {
    updateNodeData(props.id, {
      inputs: {
        ...node?.data.inputs,
        "Spreadsheet ID": v,
      },
    });
  };

  const setGoogleAccount = (email: string) => {
    updateNodeData(props.id, {
      inputs: {
        ...node?.data.inputs,
        "Google Account": email,
      },
    });
  };

  useEffect(() => {
    if (nodeData.type !== TaskType.EXPORT) return;
    if (!isGoogleExport) return;
    if (isGoogleConnected) return;

    let cancelled = false;
    fetch("/api/auth/google/export/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const email = String(j?.email ?? "").trim();
        if (email) setGoogleAccount(email);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isGoogleConnected, isGoogleExport, nodeData.type]);

  return (
    <NodeCard nodeId={props.id} isSelected={props.selected}>
      {DEV_MODE && <Badge>DEV: {props.id}</Badge>}

      {nodeData.type === TaskType.EXPORT && isGoogleExport && (
        <div className="absolute -top-3 right-2 z-10 nodrag nowheel">
          <Dialog>
            <DialogTrigger asChild>
              {isGoogleConnected ? (
                <TooltipWrapper content={googleAccount} side="top">
                  <button
                    type="button"
                    className="px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-600 text-white border border-emerald-700"
                  >
                    {googleAccount}
                  </button>
                </TooltipWrapper>
              ) : (
                <button
                  type="button"
                  className="px-2 py-1 rounded-full text-[11px] font-semibold bg-red-600 text-white border border-red-700"
                >
                  Not Connected
                </button>
              )}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Google</DialogTitle>
                <DialogDescription>
                  Bạn sẽ được điều hướng tới Google để cấp quyền Drive/Docs/Sheets.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => {
                    const returnTo = window.location.pathname + window.location.search;
                    window.location.href = `/api/auth/google/export?returnTo=${encodeURIComponent(returnTo)}`;
                  }}
                >
                  Connect Google
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <NodeHeader taskType={nodeData.type} nodeId={props.id} />
      <NodeInputs>
        {nodeData.type === TaskType.EXPORT ? (
          <div className="flex flex-col gap-3 p-3 bg-secondary w-full">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Data Preview</p>
                {!exportInputRaw.trim() && exportHasIncoming && (
                  <p className="text-[11px] text-muted-foreground">(available after execution)</p>
                )}
              </div>
              <div className="rounded-md border bg-background p-2 text-[11px] text-muted-foreground whitespace-pre-wrap">
                {exportPreviewLines.length > 0 ? (
                  exportPreviewLines.map((l, i) => <div key={i} className="break-words">{l}</div>)
                ) : (
                  <div>-</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Data Source Profile</p>
              <p className="text-xs font-semibold text-muted-foreground">{exportProfile || "-"}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Export Type</p>
              <div className="nodrag nowheel">
                <Select value={exportTypeValue} onValueChange={setExportTypeValue}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {task.inputs
                      .find((i) => i.name === "Export Type")
                      ?.options?.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {exportSuggestedTypes.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Suggested: {exportSuggestedTypes.join(", ")}
                </p>
              )}
              {exportExcelHint && (
                <p className="text-[11px] text-muted-foreground">{exportExcelHint}</p>
              )}
            </div>

            {isLocalFileExport && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">File Name</p>
                <div className="nodrag nowheel">
                  <Input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="bao-cao-thang-5"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

            {exportTypeValue === "Google Docs" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Document ID</p>
                <div className="flex gap-2 items-center">
                  <div className="nodrag nowheel flex-1">
                    <Input
                      value={docId}
                      onChange={(e) => setDocId(e.target.value)}
                      placeholder="1AbC..."
                      className="h-8 text-xs"
                    />
                  </div>
                  <TooltipWrapper content="Open" side="top">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!docId}
                      onClick={() => {
                        const url = `https://docs.google.com/document/d/${docId}/edit`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <ExternalLinkIcon size={14} />
                    </Button>
                  </TooltipWrapper>
                </div>
              </div>
            )}

            {exportTypeValue === "Google Sheets" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Spreadsheet ID</p>
                <div className="flex gap-2 items-center">
                  <div className="nodrag nowheel flex-1">
                    <Input
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                      placeholder="1AbC..."
                      className="h-8 text-xs"
                    />
                  </div>
                  <TooltipWrapper content="Open" side="top">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!spreadsheetId}
                      onClick={() => {
                        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <ExternalLinkIcon size={14} />
                    </Button>
                  </TooltipWrapper>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Field Mapping</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7"
                    disabled={exportJsonKeys.length === 0}
                    onClick={autoDetectFields}
                  >
                    Auto-detect Fields
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => setExportMappings([...(exportMappings ?? []), { column: "", value: "" }])}
                  >
                    Add row
                  </Button>
                </div>
              </div>

              <div className="rounded-md border bg-background overflow-hidden">
                <div className="grid grid-cols-2 gap-0 border-b">
                  <div className="p-2 text-[11px] font-semibold text-muted-foreground">Column</div>
                  <div className="p-2 text-[11px] font-semibold text-muted-foreground">Value</div>
                </div>
                {exportMappings.length === 0 ? (
                  <div className="p-2 text-[11px] text-muted-foreground">No mappings</div>
                ) : (
                  exportMappings.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-0 border-b last:border-b-0">
                      <div className="p-2">
                        <div className="nodrag nowheel">
                          <Input
                            value={row.column}
                            onChange={(e) => {
                              const next = exportMappings.slice();
                              next[idx] = { ...next[idx], column: e.target.value };
                              setExportMappings(next);
                            }}
                            className="h-8 text-xs"
                            placeholder="Tên sản phẩm"
                          />
                        </div>
                      </div>
                      <div className="p-2 flex gap-2 items-center">
                        <div className="nodrag nowheel flex-1">
                          {exportJsonKeys.length > 0 ? (
                            <Select
                              value={row.value}
                              onValueChange={(v) => {
                                const next = exportMappings.slice();
                                next[idx] = { ...next[idx], value: v };
                                setExportMappings(next);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {exportJsonKeys.map((k) => (
                                  <SelectItem key={k} value={k}>
                                    {k}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={row.value}
                              onChange={(e) => {
                                const next = exportMappings.slice();
                                next[idx] = { ...next[idx], value: e.target.value };
                                setExportMappings(next);
                              }}
                              className="h-8 text-xs"
                              placeholder={"key"}
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => {
                            const next = exportMappings.slice();
                            next.splice(idx, 1);
                            setExportMappings(next);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {exportJsonKeys.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Tip: to show key suggestions, provide JSON input (object or array of objects).
                </p>
              )}
            </div>
          </div>
        ) : (
          inputList.map((input: any) => (
            <div key={input.name} className={input.className}>
              <NodeInput input={input} nodeId={props.id} />
            </div>
          ))
        )}
      </NodeInputs>
      <NodeOutputs>
        {task.outputs.map(output=>(
            <NodeOutput key={output.name} output={output} nodeId={props.id} />
        ))}
      </NodeOutputs>
    </NodeCard>
  );
});
export default NodeComponent;
NodeComponent.displayName = "NodeComponent";
