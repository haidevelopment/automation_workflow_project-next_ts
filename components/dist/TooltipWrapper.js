"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var tooltip_1 = require("./ui/tooltip");
function TooltipWrapper(props) {
    return react_1["default"].createElement(tooltip_1.TooltipProvider, { delayDuration: 0 },
        react_1["default"].createElement(tooltip_1.Tooltip, null,
            react_1["default"].createElement(tooltip_1.TooltipTrigger, { asChild: true }, props.children),
            react_1["default"].createElement(tooltip_1.TooltipContent, { side: props.side }, props.content)));
}
exports["default"] = TooltipWrapper;
