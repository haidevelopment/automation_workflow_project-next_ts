"use client";
"use strict";
exports.__esModule = true;
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var react_1 = require("react");
function StringParam(_a) {
    var param = _a.param, value = _a.value, updateNodeParamValue = _a.updateNodeParamValue;
    var id = react_1.useId();
    var _b = react_1.useState(value !== null && value !== void 0 ? value : ""), internalValue = _b[0], setInternalValue = _b[1];
    return (react_1["default"].createElement("div", { className: "space-y-4 p-1 w-full" },
        react_1["default"].createElement(label_1.Label, { htmlFor: id, className: "text-xs flex" },
            param.name,
            " ",
            param.required && react_1["default"].createElement("p", { className: "text-red-400 px-2" }, "*")),
        react_1["default"].createElement(input_1.Input, { id: id, value: internalValue, onChange: function (e) { return setInternalValue(e.target.value); }, onBlur: function (e) { return updateNodeParamValue(e.target.value); }, placeholder: "Enter value here...", className: "text-xs  " }),
        param.helperText && (react_1["default"].createElement("p", { className: "text-muted-foreground px-2" }, param.helperText))));
}
exports["default"] = StringParam;
