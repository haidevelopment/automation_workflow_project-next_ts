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
var task_1 = require("@/types/task");
var react_1 = require("react");
var StringParam_1 = require("./StringParam");
var react_2 = require("@xyflow/react");
var BrowserInstanceParam_1 = require("./BrowserInstanceParam");
function NodeParamField(_a) {
    var _b;
    var param = _a.param, nodeId = _a.nodeId, disabled = _a.disabled;
    var _c = react_2.useReactFlow(), updateNodeData = _c.updateNodeData, getNode = _c.getNode;
    var node = getNode(nodeId);
    var value = (_b = node === null || node === void 0 ? void 0 : node.data.inputs) === null || _b === void 0 ? void 0 : _b[param.name];
    var updateNodeParamValue = react_1.useCallback(function (newValue) {
        var _a;
        updateNodeData(nodeId, {
            inputs: __assign(__assign({}, node === null || node === void 0 ? void 0 : node.data.inputs), (_a = {}, _a[param.name] = newValue, _a))
        });
    }, [updateNodeData, node === null || node === void 0 ? void 0 : node.data.inputs, param.name, nodeId]);
    switch (param.type) {
        case task_1.TaskParamType.STRING:
            return react_1["default"].createElement(StringParam_1["default"], { param: param, value: value, updateNodeParamValue: updateNodeParamValue, disabled: disabled });
        case task_1.TaskParamType.BROWSER_INSTANCE:
            return react_1["default"].createElement(BrowserInstanceParam_1["default"], { param: param, value: value, updateNodeParamValue: updateNodeParamValue });
        default:
            return (react_1["default"].createElement("div", { className: "w-full" },
                react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Not Implemented")));
    }
}
exports["default"] = NodeParamField;
