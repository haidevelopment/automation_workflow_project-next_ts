"use client";
"use strict";
exports.__esModule = true;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var registry_1 = require("@/lib/workflow/task/registry");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function NodeHeader(_a) {
    var taskType = _a.taskType;
    var task = registry_1.TaskRegistry[taskType];
    return (react_1["default"].createElement("div", { className: 'flex items-center gap-2 p-2' },
        react_1["default"].createElement(task.icon, { size: 16 }),
        react_1["default"].createElement("div", { className: "flex justify-between items-center w-full" },
            react_1["default"].createElement("p", { className: "text-xs font-bold uppercase text-muted-foreground" }, task.label),
            react_1["default"].createElement("div", { className: "flex gap-1 items-center" },
                task.isEntryPoint && react_1["default"].createElement(badge_1.Badge, null, "Entry Point"),
                react_1["default"].createElement(badge_1.Badge, { className: 'gap-2 flex items-center text-xs' },
                    react_1["default"].createElement(lucide_react_1.Coins, { size: 16 }),
                    " TODO"),
                react_1["default"].createElement(button_1.Button, { className: 'drag-handle cursor-grab', variant: "ghost", size: "icon" },
                    react_1["default"].createElement(lucide_react_1.GripVerticalIcon, { size: 20 }))))));
}
exports["default"] = NodeHeader;
