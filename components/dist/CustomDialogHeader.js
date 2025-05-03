"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var dialog_1 = require("./ui/dialog");
var utils_1 = require("@/lib/utils");
var separator_1 = require("./ui/separator");
function CustomDialogHeader(props) {
    var Icon = props.icon;
    return (react_1["default"].createElement(dialog_1.DialogHeader, { className: "py-6" },
        react_1["default"].createElement(dialog_1.DialogTitle, { asChild: true },
            react_1["default"].createElement("div", { className: "flex flex-col items-center gap-2 mb-2" },
                Icon && (react_1["default"].createElement(Icon, { size: 30, className: utils_1.cn("stroke-primary", props.iconClassName) })),
                props.title && (react_1["default"].createElement("p", { className: utils_1.cn("text-xl text-primary", props.titleClassName) }, props.title)),
                props.subTitle && (react_1["default"].createElement("p", { className: utils_1.cn("text-sm text-muted-foreground", props.subTitleClassName) }, props.subTitle)))),
        react_1["default"].createElement(separator_1.Separator, null)));
}
exports["default"] = CustomDialogHeader;
