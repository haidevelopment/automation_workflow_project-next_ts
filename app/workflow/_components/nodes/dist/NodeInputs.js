"use strict";
exports.__esModule = true;
exports.NodeInput = exports.NodeInputs = void 0;
var utils_1 = require("@/lib/utils");
var react_1 = require("@xyflow/react");
var react_2 = require("react");
var NodeParamField_1 = require("./NodeParamField");
var common_1 = require("./common");
function NodeInputs(_a) {
    var children = _a.children;
    return react_2["default"].createElement("div", { className: "flex flex-col divide-y gap-2" }, children);
}
exports.NodeInputs = NodeInputs;
function NodeInput(_a) {
    var input = _a.input, nodeId = _a.nodeId;
    return (react_2["default"].createElement("div", { className: "flex justify-start relative p-3 bg-secondary w-full" },
        react_2["default"].createElement(NodeParamField_1["default"], { param: input, nodeId: nodeId }),
        !input.hideHandle && (react_2["default"].createElement(Handle, { id: input.name, type: "target", position: react_1.Position.Left, className: utils_1.cn("!bg-muted-foreground !border-2 !border-background !-left-2 !w-4 !h-4 ", common_1.ColorForHandle[input.type]) }))));
}
exports.NodeInput = NodeInput;
