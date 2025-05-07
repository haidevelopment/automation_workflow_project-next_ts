"use client";
"use strict";
exports.__esModule = true;
var TooltipWrapper_1 = require("@/components/TooltipWrapper");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var SaveBtn_1 = require("./SaveBtn");
var ExecuteBtn_1 = require("./ExecuteBtn");
function Topbar(_a) {
    var title = _a.title, subTitle = _a.subTitle, workflowId = _a.workflowId;
    var router = navigation_1.useRouter();
    return (react_1["default"].createElement("header", { className: 'flex p-2 border-p-2 border-separate justify-between w-full h-[60px] sticky top-0 bg-background z-10' },
        react_1["default"].createElement("div", { className: "flex gap-1 flex-1 " },
            react_1["default"].createElement(TooltipWrapper_1["default"], { content: "Back" },
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return router.back(); } },
                    react_1["default"].createElement(lucide_react_1.ChevronLeftIcon, { size: 20 }))),
            react_1["default"].createElement("div", { className: "" },
                react_1["default"].createElement("p", { className: "font-bold text-ellipsis truncate" }, title),
                subTitle && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground truncate text-ellipsis" }, subTitle)))),
        react_1["default"].createElement("div", { className: "flex gap-1 flex-1 justify-end" },
            react_1["default"].createElement(ExecuteBtn_1["default"], { workflowId: workflowId }),
            react_1["default"].createElement(SaveBtn_1["default"], { workflowId: workflowId }))));
}
exports["default"] = Topbar;
