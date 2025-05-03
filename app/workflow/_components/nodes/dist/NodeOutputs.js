"use client";
"use strict";
exports.__esModule = true;
exports.NodeOutput = exports.NodeOutputs = void 0;
var utils_1 = require("@/lib/utils");
var react_1 = require("@xyflow/react");
var react_2 = require("react");
var common_1 = require("./common");
function NodeOutputs(_a) {
    var children = _a.children;
    return react_2["default"].createElement("div", { className: "flex flex-col divide-y gap-1" }, children);
}
exports.NodeOutputs = NodeOutputs;
function NodeOutput(_a) {
    var output = _a.output, nodeId = _a.nodeId;
    return (react_2["default"].createElement("div", { className: "flex justify-end relative p-3 bg-secondary" },
        react_2["default"].createElement("p", { className: "text-xs text-muted-foreground" }, output.name),
        react_2["default"].createElement(Handle, { id: output.name, type: "source", position: react_1.Position.Right, className: utils_1.cn("!bg-muted-foreground !border-2 !border-background !-right-2 !w-4 !h-4", common_1.ColorForHandle[output.type]) })));
}
exports.NodeOutput = NodeOutput;
