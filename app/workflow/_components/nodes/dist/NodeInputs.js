"use strict";
exports.__esModule = true;
exports.NodeInput = exports.NodeInputs = void 0;
var utils_1 = require("@/lib/utils");
var react_1 = require("@xyflow/react");
var react_2 = require("react");
var NodeParamField_1 = require("./NodeParamField");
var common_1 = require("./common");
var useFlowValidation_1 = require("@/components/hooks/useFlowValidation");
function NodeInputs(_a) {
    var children = _a.children;
    return react_2["default"].createElement("div", { className: "flex flex-col divide-y gap-2" }, children);
}
exports.NodeInputs = NodeInputs;
function NodeInput(_a) {
    var _b;
    var input = _a.input, nodeId = _a.nodeId;
    var invalidInputs = useFlowValidation_1["default"]().invalidInputs;
    var edges = react_1.useEdges();
    var isConnected = edges.some(function (edge) { return edge.target === nodeId && edge.targetHandle == input.name; });
    var hasErrors = (_b = invalidInputs.find(function (node) { return node.nodeId == nodeId; })) === null || _b === void 0 ? void 0 : _b.inputs.find(function (invalidInput) { return invalidInput === input.name; });
    return (react_2["default"].createElement("div", { className: utils_1.cn("flex justify-start relative p-3 bg-secondary w-full", hasErrors && "bg-destructive/30") },
        react_2["default"].createElement(NodeParamField_1["default"], { param: input, nodeId: nodeId, disabled: isConnected }),
        !input.hideHandle && (react_2["default"].createElement(Handle, { id: input.name, type: "target", isConnectable: !isConnected, position: react_1.Position.Left, className: utils_1.cn("!bg-muted-foreground !border-2 !border-background !-left-2 !w-4 !h-4 ", common_1.ColorForHandle[input.type]) }))));
}
exports.NodeInput = NodeInput;
