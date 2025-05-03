"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
function BrowserInstanceParam(_a) {
    var param = _a.param;
    return (react_1["default"].createElement("p", { className: 'text-xs ' }, param.name));
}
exports["default"] = BrowserInstanceParam;
