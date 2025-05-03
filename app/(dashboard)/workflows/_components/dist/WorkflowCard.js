"use client";
"use strict";
var _a;
exports.__esModule = true;
var TooltipWrapper_1 = require("@/components/TooltipWrapper");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var utils_1 = require("@/lib/utils");
var workflow_1 = require("@/types/workflow");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var react_1 = require("react");
var DeleteWorkflowDialog_1 = require("./DeleteWorkflowDialog");
var statusColors = (_a = {},
    _a[workflow_1.WorkflowStatus.DRAF] = "bg-yellow-400 text-yellow-600",
    _a[workflow_1.WorkflowStatus.PUBLISHER] = "bg-primary-40 text-primary-60",
    _a);
function WorkflowCard(_a) {
    var workflow = _a.workflow;
    var isDraf = workflow.status == workflow_1.WorkflowStatus.DRAF;
    return (react_1["default"].createElement(card_1.Card, { className: "border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30" },
        react_1["default"].createElement(card_1.CardContent, { className: "p-4 flex items-center justify-between h-[100px]" },
            react_1["default"].createElement("div", { className: "flex items-center justify-end space-x-3" },
                react_1["default"].createElement("div", { className: utils_1.cn("w-10 h-10 rounded-full flex items-center bg-red-500 justify-center", statusColors[workflow.status]) }, isDraf ? (react_1["default"].createElement(lucide_react_1.FileTextIcon, { className: "h5 w-5" })) : (react_1["default"].createElement(lucide_react_1.PlayIcon, { className: "h5 w-5 text-white" }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h3", { className: "text-base font-bold text-muted-foreground flex items-center" },
                        react_1["default"].createElement(link_1["default"], { href: "workflow/editor/" + workflow.id, className: "flex items-center hover:underline" }, workflow.name),
                        isDraf && (react_1["default"].createElement("span", { className: "ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full" }, workflow_1.WorkflowStatus.DRAF))))),
            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                react_1["default"].createElement(link_1["default"], { href: "workflow/editor/" + workflow.id, className: utils_1.cn(button_1.buttonVariants({
                        variant: "outline",
                        size: "sm"
                    }), "flex items-center gap-2") },
                    react_1["default"].createElement(lucide_react_1.ShuffleIcon, { size: 16 }),
                    "Edit"),
                react_1["default"].createElement(WorkflowActions, { workflowName: workflow.name, workflowId: workflow.id })))));
}
function WorkflowActions(_a) {
    var workflowName = _a.workflowName, workflowId = _a.workflowId;
    var _b = react_1.useState(false), showDeleteDilog = _b[0], setShowDeleteDialog = _b[1];
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(DeleteWorkflowDialog_1["default"], { open: showDeleteDilog, setOpen: setShowDeleteDialog, workflowName: workflowName, workflowId: workflowId }),
        react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
            react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm" },
                    react_1["default"].createElement(TooltipWrapper_1["default"], { content: "More Actions" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-center w-full h-full" },
                            react_1["default"].createElement(lucide_react_1.MoreVerticalIcon, { size: 18 }))))),
            react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, null, "Actions"),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { className: "text-destructive flex items-center gap-2", onSelect: function () {
                        setShowDeleteDialog(!showDeleteDilog);
                    } },
                    react_1["default"].createElement(lucide_react_1.TrashIcon, null),
                    " Delete")))));
}
exports["default"] = WorkflowCard;
