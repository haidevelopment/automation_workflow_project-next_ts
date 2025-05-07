"use client";
"use strict";
exports.__esModule = true;
var runWorkflow_1 = require("@/actions/workflows/runWorkflow");
var useExecutionPlan_1 = require("@/components/hooks/useExecutionPlan");
var button_1 = require("@/components/ui/button");
var react_query_1 = require("@tanstack/react-query");
var react_1 = require("@xyflow/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sonner_1 = require("sonner");
function ExecuteBtn(_a) {
    var workflowId = _a.workflowId;
    var generate = useExecutionPlan_1["default"]();
    var toObject = react_1.useReactFlow().toObject;
    var mutation = react_query_1.useMutation({
        mutationFn: runWorkflow_1.RunWorkflow,
        onSuccess: function () {
            sonner_1.toast.success("Workflow is running", { id: "flow-execution" });
        },
        onError: function () {
            sonner_1.toast.error("Workflow run is failed", { id: "flow-execution" });
        }
    });
    return (react_2["default"].createElement(button_1.Button, { variant: "outline", className: 'flex items-center gap-2', disabled: mutation.isPending, onClick: function () {
            var plan = generate();
            console.log("____plan____");
            console.table(plan);
            if (!plan) {
                //validation
                return;
            }
            mutation.mutate({
                workflowId: workflowId,
                flowDefinition: JSON.stringify(toObject())
            });
        } },
        react_2["default"].createElement(lucide_react_1.PlayIcon, { size: 16, className: 'stroke-orange-400' }),
        " Execute"));
}
exports["default"] = ExecuteBtn;
