"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_2 = require("@xyflow/react");
var FlowEditor_1 = require("./FlowEditor");
var Topbar_1 = require("./topbar/Topbar");
var TaskMenu_1 = require("./TaskMenu");
var FlowValidationContext_1 = require("@/components/context/FlowValidationContext");
function Editor(_a) {
    var workflow = _a.workflow;
    return (react_1["default"].createElement(FlowValidationContext_1.FlowValidationContextProvider, null,
        react_1["default"].createElement(react_2.ReactFlowProvider, null,
            react_1["default"].createElement("div", { className: "flex flex-col h-full w-full overflow-hidden" },
                react_1["default"].createElement(Topbar_1["default"], { title: "Workflow Editor", workflowId: workflow.id, subTitle: workflow.name }),
                react_1["default"].createElement("section", { className: "flex h-full overflow-auto" },
                    react_1["default"].createElement(TaskMenu_1["default"], null),
                    react_1["default"].createElement(FlowEditor_1["default"], { workflow: workflow }))))));
}
exports["default"] = Editor;
