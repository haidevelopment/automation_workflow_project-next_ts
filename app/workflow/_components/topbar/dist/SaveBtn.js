"use client";
"use strict";
exports.__esModule = true;
var updateWorkflow_1 = require("@/actions/workflows/updateWorkflow");
var button_1 = require("@/components/ui/button");
var react_query_1 = require("@tanstack/react-query");
var react_1 = require("@xyflow/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sonner_1 = require("sonner");
function SaveBtn(_a) {
    var workflowId = _a.workflowId;
    var toObject = react_1.useReactFlow().toObject;
    var saveMutation = react_query_1.useMutation({
        mutationFn: updateWorkflow_1.UpdateWorkflow,
        onSuccess: function () {
            sonner_1.toast.success("Update successful...!", { id: workflowId });
        },
        onError: function () {
            sonner_1.toast.error("Update workflow failed...!", { id: workflowId });
        }
    });
    return (react_2["default"].createElement(button_1.Button, { disabled: saveMutation.isPending, variant: "outline", className: 'flex items-center gap-2', onClick: function () {
            var workflowDefinition = JSON.stringify(toObject());
            sonner_1.toast.loading("Saving workflow ....!");
            saveMutation.mutate({
                id: workflowId,
                definition: workflowDefinition
            });
        } },
        react_2["default"].createElement(lucide_react_1.CheckIcon, { size: 16, className: 'stroke-green-500' }),
        "Save"));
}
exports["default"] = SaveBtn;
