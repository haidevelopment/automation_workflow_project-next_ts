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
var nodeType = {
    FlowScrapeNode: NodeComponent_1["default"]
};
var snapGrid = [50, 50];
var fitViewOptions = { padding: 1 };
function FlowEditor(_a) {
    var workflow = _a.workflow;
    var _b = react_1.useNodesState([
        CreateFlowNode_1.CreateFlowNode(task_1.TaskType.LAUCH_BROWSER),
    ]), nodes = _b[0], setNodes = _b[1], onNodesChange = _b[2];
    var _c = react_1.useEdgesState([]), edges = _c[0], setEdges = _c[1], onEdgesChange = _c[2];
    var _d = react_1.useReactFlow(), setViewport = _d.setViewport, screenToFlowPosition = _d.screenToFlowPosition;
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
    }, []);
    var onConnect = react_2.useCallback(function (connection) {
        console.log("@ON CONNECT", connection);
        setEdges(function (eds) { return react_1.addEdge(__assign(__assign({}, connection), { animated: true }), eds); });
    }, []);
    return (react_2["default"].createElement("main", { className: "h-full w-full " },
        react_2["default"].createElement(react_1.ReactFlow, { nodes: nodes, edges: edges, onEdgesChange: onEdgesChange, onNodesChange: onNodesChange, nodeTypes: nodeType, snapToGrid: true, snapGrid: snapGrid, fitView: true, fitViewOptions: fitViewOptions, onDragOver: onDragOver, onDrop: onDrop, onConnect: onConnect },
            react_2["default"].createElement(react_1.Controls, { position: "top-left", fitViewOptions: fitViewOptions }),
            react_2["default"].createElement(react_1.Background, { variant: react_1.BackgroundVariant.Dots, gap: 12, size: 1 }))));
}
exports["default"] = FlowEditor;
