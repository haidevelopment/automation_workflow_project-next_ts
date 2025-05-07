"use client";
"use strict";
exports.__esModule = true;
var accordion_1 = require("@/components/ui/accordion");
var button_1 = require("@/components/ui/button");
var registry_1 = require("@/lib/workflow/task/registry");
var task_1 = require("@/types/task");
var react_1 = require("react");
function TaskMenu() {
    return (react_1["default"].createElement("aside", { className: "w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate h-full p-2 px-4 overflow-auto" },
        react_1["default"].createElement(accordion_1.Accordion, { type: "multiple", className: "w-full", defaultValue: ["extraction"] },
            react_1["default"].createElement(accordion_1.AccordionItem, { value: "extraction" },
                react_1["default"].createElement(accordion_1.AccordionTrigger, { className: "font-bold" }, "Data Extaction"),
                react_1["default"].createElement(accordion_1.AccordionContent, { className: "flex flex-col gap-1" },
                    react_1["default"].createElement(TaskMenuBtn, { taskType: task_1.TaskType.PAGE_TO_HTML }),
                    react_1["default"].createElement(TaskMenuBtn, { taskType: task_1.TaskType.EXTRACT_TEXT_FROM_ELEMENT }))))));
}
function TaskMenuBtn(_a) {
    var taskType = _a.taskType;
    var task = registry_1.TaskRegistry[taskType];
    var onDragStart = function (event, type) {
        event.dataTransfer.setData("application/reactflow", type);
        event.dataTransfer.effectAllowed = "move";
    };
    return (react_1["default"].createElement(button_1.Button, { variant: "secondary", className: "flex justify-between items-center w-full gap-2 border", draggable: true, onDragStart: function (event) { return onDragStart(event, taskType); } },
        react_1["default"].createElement("div", { className: "flex gap-2 " },
            react_1["default"].createElement(task.icon, { size: 20 }),
            task.label)));
}
exports["default"] = TaskMenu;
