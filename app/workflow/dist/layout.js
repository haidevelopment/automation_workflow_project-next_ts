"use strict";
exports.__esModule = true;
var Logo_1 = require("@/components/Logo");
var ThemeModeToggle_1 = require("@/components/ThemeModeToggle");
var react_separator_1 = require("@radix-ui/react-separator");
var react_1 = require("react");
function layout(_a) {
    var children = _a.children;
    return (react_1["default"].createElement("div", { className: 'flex flex-col w-full h-screen' },
        children,
        react_1["default"].createElement(react_separator_1.Separator, null),
        react_1["default"].createElement("footer", { className: "flex items-center justify-between p-2" },
            react_1["default"].createElement(Logo_1["default"], { iconSize: 16, fontSize: 'text-xl' }),
            react_1["default"].createElement(ThemeModeToggle_1.ModeToggle, null))));
}
exports["default"] = layout;
