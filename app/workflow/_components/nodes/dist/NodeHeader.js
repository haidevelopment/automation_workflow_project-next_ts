"use client";
"use strict";
exports.__esModule = true;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var CreateFlowNode_1 = require("@/lib/workflow/CreateFlowNode");
var registry_1 = require("@/lib/workflow/task/registry");
var react_1 = require("@xyflow/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
function NodeHeader(_a) {
    var taskType = _a.taskType, nodeId = _a.nodeId;
    var task = registry_1.TaskRegistry[taskType];
    var _b = react_1.useReactFlow(), deleteElements = _b.deleteElements, getNode = _b.getNode, addNodes = _b.addNodes;
    return (react_2["default"].createElement("div", { className: "flex items-center gap-2 p-2" },
        react_2["default"].createElement(task.icon, { size: 16 }),
        react_2["default"].createElement("div", { className: "flex justify-between items-center w-full" },
            react_2["default"].createElement("p", { className: "text-xs font-bold uppercase text-muted-foreground" }, task.label),
            react_2["default"].createElement("div", { className: "flex gap-1 items-center" },
                task.isEntryPoint && react_2["default"].createElement(badge_1.Badge, null, "Entry Point"),
                react_2["default"].createElement(badge_1.Badge, { className: "gap-2 flex items-center text-xs" },
                    react_2["default"].createElement(lucide_react_1.Coins, { size: 16 }),
                    " ",
                    task.credits),
                !task.isEntryPoint && (react_2["default"].createElement(react_2["default"].Fragment, null,
                    react_2["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () {
                            deleteElements({
                                nodes: [{ id: nodeId }]
                            });
                        } },
                        react_2["default"].createElement(lucide_react_1.TrashIcon, { size: 12 })))),
                !task.isEntryPoint && (react_2["default"].createElement(react_2["default"].Fragment, null,
                    react_2["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () {
                            var node = getNode(nodeId);
                            console.log("@NODE", node);
                            var newX = node.position.x + node.measured.width + 20;
                            var newY = node.position.y + node.measured.height + 20;
                            var newNode = CreateFlowNode_1.CreateFlowNode(node.data.type, {
                                x: newX,
                                y: newY
                            });
                            addNodes([newNode]);
                        } },
                        react_2["default"].createElement(lucide_react_1.CopyIcon, { size: 12 })))),
                react_2["default"].createElement(button_1.Button, { className: "drag-handle cursor-grab", variant: "ghost", size: "icon" },
                    react_2["default"].createElement(lucide_react_1.GripVerticalIcon, { size: 20 }))))));
}
exports["default"] = NodeHeader;
