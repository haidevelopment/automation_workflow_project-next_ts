"use client";
"use strict";
exports.__esModule = true;
var deleteWorkflow_1 = require("@/actions/workflows/deleteWorkflow");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var input_1 = require("@/components/ui/input");
var react_query_1 = require("@tanstack/react-query");
var react_1 = require("react");
var sonner_1 = require("sonner");
function DeleteWorkflowDialog(_a) {
    var open = _a.open, setOpen = _a.setOpen, workflowName = _a.workflowName, workflowId = _a.workflowId;
    var _b = react_1.useState(""), confirmText = _b[0], setConfirmText = _b[1];
    var deleteMutation = react_query_1.useMutation({
        mutationFn: deleteWorkflow_1.DeleteWorkflow,
        onSuccess: function () {
            sonner_1.toast.success("Xóa thành công workflows", { id: workflowId });
            setConfirmText("");
        },
        onError: function () {
            sonner_1.toast.error("Something went wrong delete workflows", { id: workflowId });
        }
    });
    return (react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: open, onOpenChange: setOpen },
        react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
            react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null, "Are yout absolutely sure ?"),
                react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null,
                    "If you delete workflow , you will not be able to recover it",
                    react_1["default"].createElement("div", { className: "flex-flex-col py-4 gap-2" },
                        react_1["default"].createElement("p", null,
                            "If you are sure ,enter ",
                            react_1["default"].createElement("b", null, workflowName),
                            " to confirm"),
                        react_1["default"].createElement(input_1.Input, { value: confirmText, onChange: function (e) { return setConfirmText(e.target.value); } })))),
            react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, { onClick: function () { return setConfirmText(""); } }, "Cancel"),
                react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", disabled: confirmText != workflowName || deleteMutation.isPending, onClick: function (e) {
                        e.stopPropagation();
                        sonner_1.toast.loading("Deleting workflow...", { id: workflowId });
                        deleteMutation.mutate(workflowId);
                    } }, "Delete")))));
}
exports["default"] = DeleteWorkflowDialog;
