"use strict";
exports.__esModule = true;
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var react_1 = require("react");
function Logo(_a) {
    var _b = _a.fontSize, fontSize = _b === void 0 ? "text-2xl" : _b, _c = _a.iconSize, iconSize = _c === void 0 ? 20 : _c;
    return (react_1["default"].createElement(link_1["default"], { href: "/", className: utils_1.cn("text-2xl font-extrabold flex items-center gap-2", fontSize) },
        react_1["default"].createElement("div", { className: "rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-2" },
            react_1["default"].createElement(lucide_react_1.SquareDashedMousePointer, { size: iconSize, className: "stroke-white" })),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("span", { className: "bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent" }, "Flow"),
            react_1["default"].createElement("span", { className: "text-stone-700 dark:text-stone-300" }, "Scrape"))));
}
exports["default"] = Logo;
