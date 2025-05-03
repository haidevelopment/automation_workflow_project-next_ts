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
var CustomDialogHeader_1 = require("@/components/CustomDialogHeader");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var workflow_1 = require("@/schema/workflow");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var react_query_1 = require("@tanstack/react-query");
var createWorkflow_1 = require("@/actions/workflows/createWorkflow");
var sonner_1 = require("sonner");
function CreateWorkflowDialog(_a) {
    var tringgerText = _a.tringgerText;
    var _b = react_1.useState(false), open = _b[0], setOpen = _b[1];
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(workflow_1.workflowSchema),
        defaultValues: {}
    });
    var _c = react_query_1.useMutation({
        mutationFn: createWorkflow_1.CreateWorkflow,
        onSuccess: function () {
            sonner_1.toast.success("Workflow created", { id: "created-workflow" });
        },
        onError: function () {
            sonner_1.toast.error("Failer to create workflow", { id: "created-workflow" });
        }
    }), mutate = _c.mutate, isPending = _c.isPending;
    var onSubmit = react_1.useCallback(function (values) {
        sonner_1.toast.loading("Creating workflow...", { id: "create-workflow" });
        mutate(values);
    }, [mutate]);
    return (react_1["default"].createElement(dialog_1.Dialog, { open: open, onOpenChange: function (open) {
            form.reset();
            setOpen(open);
        } },
        react_1["default"].createElement(dialog_1.DialogTrigger, { asChild: true },
            react_1["default"].createElement(button_1.Button, null, tringgerText !== null && tringgerText !== void 0 ? tringgerText : "Create Workflow")),
        react_1["default"].createElement(dialog_1.DialogContent, { className: "px-0" },
            react_1["default"].createElement(CustomDialogHeader_1["default"], { icon: lucide_react_1.Layers2Icon, title: "Create Workflow", subTitle: "Start Building your workflow" }),
            react_1["default"].createElement("div", { className: "p-6" },
                react_1["default"].createElement(form_1.Form, __assign({}, form),
                    react_1["default"].createElement("form", { className: "space-y-8 w-full", onSubmit: form.handleSubmit(onSubmit) },
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "name", render: function (_a) {
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, { className: "flex gap-1 items-center" },
                                        "Name",
                                        react_1["default"].createElement("p", { className: "text-xs text-primary " }, "(required)")),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({}, field))),
                                    react_1["default"].createElement(form_1.FormDescription, null, "Choose a description and unique name")));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "description", render: function (_a) {
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, { className: "flex gap-1 items-center" },
                                        "Description",
                                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground " }, "(optional)")),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(textarea_1.Textarea, __assign({ className: "resize-none" }, field))),
                                    react_1["default"].createElement(form_1.FormDescription, null,
                                        "Provide a brief description of that your workflow does ",
                                        react_1["default"].createElement("br", null),
                                        "This is optional but can help you remember the workflow purpose")));
                            } }),
                        react_1["default"].createElement(button_1.Button, { type: "submit", className: "w-full", disabled: isPending },
                            !isPending && "Proceed",
                            isPending && react_1["default"].createElement(lucide_react_1.Loader2, { className: "animate-spin" }))))))));
}
exports["default"] = CreateWorkflowDialog;
