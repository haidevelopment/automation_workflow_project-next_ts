"use client";
import TooltipWrapper from "@/components/TooltipWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateFlowNode } from "@/lib/workflow/CreateFlowNode";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";
import { Handle, Position, useEdges, useReactFlow } from "@xyflow/react";
import { AlertTriangle, Coins, CopyIcon, GripVerticalIcon, TrashIcon } from "lucide-react";
import React from "react";

function NodeHeader({
  taskType,
  nodeId,
}: {
  taskType: TaskType;
  nodeId: string;
}) {
  const task = TaskRegistry[taskType];
  const { deleteElements, getNode, addNodes } = useReactFlow();
  const edges = useEdges();
  const node = getNode(nodeId) as AppNode | undefined;

  const isAINodeMissingConfig =
    taskType === TaskType.AI &&
    (!String(node?.data?.inputs?.["Model"] ?? "").trim() ||
      !String(node?.data?.inputs?.["API Key"] ?? "").trim());
  const isAINodeMainInputConnected =
    taskType === TaskType.AI &&
    edges.some(
      (edge) => edge.target === nodeId && (edge.targetHandle === "Input" || edge.targetHandle === "MAIN")
    );
  return (
    <div
      className={
        taskType === TaskType.AI
          ? "flex items-center gap-2 p-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
          : taskType === TaskType.EXPORT
            ? "flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
            : "flex items-center gap-2 p-2"
      }
    >
      {taskType === TaskType.AI && (
        <Handle
          id="Input"
          type="target"
          position={Position.Left}
          isConnectable={!isAINodeMainInputConnected}
          className="!bg-violet-200 !border-2 !border-violet-900 !-left-2 !w-4 !h-4"
        />
      )}
      {taskType === TaskType.EXPORT && (
        <Handle
          id="Input"
          type="target"
          position={Position.Top}
          isConnectable
          className="!bg-emerald-200 !border-2 !border-emerald-900 !-top-2 !w-4 !h-4"
        />
      )}
      <task.icon size={16} className={taskType === TaskType.AI ? "stroke-white" : undefined} />
      <div className="flex justify-between items-center w-full">
        <p
          className={
            taskType === TaskType.AI || taskType === TaskType.EXPORT
              ? "text-xs font-bold uppercase text-white/90"
              : "text-xs font-bold uppercase text-muted-foreground"
          }
        >
          {task.label}
        </p>
        <div className="flex gap-1 items-center">
          {isAINodeMissingConfig && (
            <TooltipWrapper content="Vui lòng hoàn thành cấu hình AI để chạy luồng" side="top">
              <div className="mr-1 inline-flex items-center">
                <AlertTriangle size={14} className="text-yellow-400" />
              </div>
            </TooltipWrapper>
          )}
          {task.isEntryPoint && <Badge>Entry Point</Badge>}
          <Badge className="gap-2 flex items-center text-xs">
            <Coins size={16} /> {task.credits}
          </Badge>
          {!task.isEntryPoint && (
            <>
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => {
                  deleteElements({
                    nodes: [{ id: nodeId }],
                  });
                }}
              >
                <TrashIcon size={12} />
              </Button>
            </>
          )}
          {!task.isEntryPoint && (
            <>
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => {
                  const node = getNode(nodeId) as AppNode;
                  console.log("@NODE", node);
                  const newX =
                    node.position.x + (node.measured?.width ?? 0) + 20;
                  const newY =
                    node.position.y + (node.measured?.height ?? 0) + 20;

                  const newNode = CreateFlowNode(node.data.type, {
                    x: newX,
                    y: newY,
                  });
                  addNodes([newNode]);
                }}
              >
                <CopyIcon size={12} />
              </Button>
            </>
          )}
          <Button
            className="drag-handle cursor-grab"
            variant={"ghost"}
            size={"icon"}
          >
            <GripVerticalIcon size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NodeHeader;
