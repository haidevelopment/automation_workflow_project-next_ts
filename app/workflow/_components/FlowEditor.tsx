"use client";
import { Workflow } from "@/lib/generated/prisma";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  getOutgoers,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import { TaskType } from "@/types/task";
import NodeComponent from "./nodes/NodeComponent";
import { CreateFlowNode } from "@/lib/workflow/CreateFlowNode";
import DeletableEdge from "./edges/DeletableEdge";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { toast } from "sonner";
import { AppNode } from "@/types/appNode";
const nodeType = {
  FlowScrapeNode: NodeComponent,
};
const edgeType = {
  default: DeletableEdge,
};
const snapGrid: [number, number] = [50, 50];
const fitViewOptions = { padding: 1 };
function FlowEditor({ workflow }: { workflow: Workflow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    CreateFlowNode(TaskType.LAUCH_BROWSER),
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();
  useEffect(() => {
    try {
      const flow = JSON.parse(workflow.definition);
      if (!flow) return;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      if (!flow.viewport) return;
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setViewport({ x, y, zoom });
    } catch (error) {}
  }, [workflow.definition, setEdges, setNodes, setViewport]);
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const taskType = event.dataTransfer.getData("application/reactflow");
      if (typeof taskType === undefined || !taskType) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = CreateFlowNode(taskType as TaskType, position);
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );
  const onConnect = useCallback(
    (connection: Connection) => {
      console.log("@ON CONNECT", connection);
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
      if (!connection.targetHandle) return;
      //remove input value if is present on connection
      const node = nodes.find((nds) => nds.id === connection.target);
      if (!node) return;
      const nodeInputs = node.data.inputs;
      updateNodeData(node.id, {
        inputs: {
          ...nodeInputs,
          [connection.targetHandle]: "",
        },
      });
    },
    [setEdges, updateNodeData, nodes]
  );
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (connection.source === connection.target) {
        return false;
      }
  
      const source = nodes.find((node) => node.id === connection.source);
      const target = nodes.find((node) => node.id === connection.target);
  
      if (!source || !target) {
        console.error("Invalid connection: source or target node not found");
        toast.error("Lỗi kết nối: Source hoặc Target không tồn tại!");
        return false;
      }
  
      const sourceTask = TaskRegistry[source.data.type];
      const targetTask = TaskRegistry[target.data.type];
  
      if (!sourceTask || !targetTask) {
        console.error("Invalid task type in registry");
        toast.error("Lỗi: Loại node không hợp lệ!");
        return false;
      }
  
      const output = sourceTask.outputs.find(
        (o) => o.name === connection.sourceHandle
      );
      const input = targetTask.inputs.find(
        (o) => o.name === connection.targetHandle
      );
  
      if (output?.type !== input?.type) {
        console.error("Type mismatch");
        toast.error("Bạn không được kết nối các kiểu khác nhau!");
        return false;
      }
  
      const hasCycle = (node: AppNode, visited = new Set()): boolean => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);
        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
        return false;
      };
  
      const detectedCycle = hasCycle(target);
      if (detectedCycle) {
        toast.error("Kết nối tạo vòng lặp!");
        return false;
      }
  
      toast.success("Nối thành công Node");
      return true;
    },
    [nodes, edges]
  );
  
  return (
    <main className="h-full w-full ">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        nodeTypes={nodeType}
        edgeTypes={edgeType}
        snapToGrid
        snapGrid={snapGrid}
        fitView
        fitViewOptions={fitViewOptions}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
      >
        <Controls position="top-left" fitViewOptions={fitViewOptions} />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </main>
  );
}

export default FlowEditor;
