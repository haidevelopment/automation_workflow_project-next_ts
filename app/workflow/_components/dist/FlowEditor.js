"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("@xyflow/react");
var react_2 = require("react");
require("@xyflow/react/dist/style.css");
var task_1 = require("@/types/task");
var NodeComponent_1 = require("./nodes/NodeComponent");
var CreateFlowNode_1 = require("@/lib/workflow/CreateFlowNode");
var DeletableEdge_1 = require("./edges/DeletableEdge");
var registry_1 = require("@/lib/workflow/task/registry");
var sonner_1 = require("sonner");
var nodeType = {
    FlowScrapeNode: NodeComponent_1["default"]
};
var edgeType = {
    "default": DeletableEdge_1["default"]
};
var snapGrid = [50, 50];
var fitViewOptions = { padding: 1 };
function FlowEditor(_a) {
    var workflow = _a.workflow;
    var _b = react_1.useNodesState([
        CreateFlowNode_1.CreateFlowNode(task_1.TaskType.LAUCH_BROWSER),
    ]), nodes = _b[0], setNodes = _b[1], onNodesChange = _b[2];
    var _c = react_1.useEdgesState([]), edges = _c[0], setEdges = _c[1], onEdgesChange = _c[2];
    var _d = react_1.useReactFlow(), setViewport = _d.setViewport, screenToFlowPosition = _d.screenToFlowPosition, updateNodeData = _d.updateNodeData;
    react_2.useEffect(function () {
        try {
            var flow = JSON.parse(workflow.definition);
            if (!flow)
                return;
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (!flow.viewport)
                return;
            var _a = flow.viewport, _b = _a.x, x = _b === void 0 ? 0 : _b, _c = _a.y, y = _c === void 0 ? 0 : _c, _d = _a.zoom, zoom = _d === void 0 ? 1 : _d;
            setViewport({ x: x, y: y, zoom: zoom });
        }
        catch (error) { }
    }, [workflow.definition, setEdges, setNodes, setViewport]);
    var onDragOver = react_2.useCallback(function (event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);
    var onDrop = react_2.useCallback(function (event) {
        event.preventDefault();
        var taskType = event.dataTransfer.getData("application/reactflow");
        if (typeof taskType === undefined || !taskType)
            return;
        var position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        });
        var newNode = CreateFlowNode_1.CreateFlowNode(taskType, position);
        setNodes(function (nds) { return nds.concat(newNode); });
    }, [screenToFlowPosition, setNodes]);
    var onConnect = react_2.useCallback(function (connection) {
        var _a;
        console.log("@ON CONNECT", connection);
        setEdges(function (eds) { return react_1.addEdge(__assign(__assign({}, connection), { animated: true }), eds); });
        if (!connection.targetHandle)
            return;
        //remove input value if is present on connection
        var node = nodes.find(function (nds) { return nds.id === connection.target; });
        if (!node)
            return;
        var nodeInputs = node.data.inputs;
        updateNodeData(node.id, {
            inputs: __assign(__assign({}, nodeInputs), (_a = {}, _a[connection.targetHandle] = "", _a))
        });
    }, [setEdges, updateNodeData, nodes]);
    var isValidConnection = react_2.useCallback(function (connection) {
        if (connection.source === connection.target) {
            return false;
        }
        var source = nodes.find(function (node) { return node.id === connection.source; });
        var target = nodes.find(function (node) { return node.id === connection.target; });
        if (!source || !target) {
            console.error("Invalid connection: source or target node not found");
            sonner_1.toast.error("Lỗi kết nối: Source hoặc Target không tồn tại!");
            return false;
        }
        var sourceTask = registry_1.TaskRegistry[source.data.type];
        var targetTask = registry_1.TaskRegistry[target.data.type];
        if (!sourceTask || !targetTask) {
            console.error("Invalid task type in registry");
            sonner_1.toast.error("Lỗi: Loại node không hợp lệ!");
            return false;
        }
        var output = sourceTask.outputs.find(function (o) { return o.name === connection.sourceHandle; });
        var input = targetTask.inputs.find(function (o) { return o.name === connection.targetHandle; });
        if ((output === null || output === void 0 ? void 0 : output.type) !== (input === null || input === void 0 ? void 0 : input.type)) {
            console.error("Type mismatch");
            sonner_1.toast.error("Bạn không được kết nối các kiểu khác nhau!");
            return false;
        }
        var hasCycle = function (node, visited) {
            if (visited === void 0) { visited = new Set(); }
            if (visited.has(node.id))
                return false;
            visited.add(node.id);
            for (var _i = 0, _a = react_1.getOutgoers(node, nodes, edges); _i < _a.length; _i++) {
                var outgoer = _a[_i];
                if (outgoer.id === connection.source)
                    return true;
                if (hasCycle(outgoer, visited))
                    return true;
            }
            return false;
        };
        var detectedCycle = hasCycle(target);
        if (detectedCycle) {
            sonner_1.toast.error("Kết nối tạo vòng lặp!");
            return false;
        }
        sonner_1.toast.success("Nối thành công Node");
        return true;
    }, [nodes, edges]);
    return (react_2["default"].createElement("main", { className: "h-full w-full " },
        react_2["default"].createElement(react_1.ReactFlow, { nodes: nodes, edges: edges, onEdgesChange: onEdgesChange, onNodesChange: onNodesChange, nodeTypes: nodeType, edgeTypes: edgeType, snapToGrid: true, snapGrid: snapGrid, fitView: true, fitViewOptions: fitViewOptions, onDragOver: onDragOver, onDrop: onDrop, onConnect: onConnect, isValidConnection: isValidConnection },
            react_2["default"].createElement(react_1.Controls, { position: "top-left", fitViewOptions: fitViewOptions }),
            react_2["default"].createElement(react_1.Background, { variant: react_1.BackgroundVariant.Dots, gap: 12, size: 1 }))));
}
exports["default"] = FlowEditor;
