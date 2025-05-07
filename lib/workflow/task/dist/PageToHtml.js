"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.WorkflowTask = exports.satisfies = exports.PageToHtmlTask = void 0;
var task_1 = require("@/types/task");
var lucide_react_1 = require("lucide-react");
exports.PageToHtmlTask = {
    type: task_1.TaskType.PAGE_TO_HTML,
    label: "GET HTML FROM PAGE",
    icon: function (props) { return (React.createElement(lucide_react_1.CodeIcon, __assign({ className: "stroke-rose-400" }, props))); },
    isEntryPoint: false,
    credits: 2,
    inputs: [
        {
            name: "Web Page",
            type: task_1.TaskParamType.BROWSER_INSTANCE,
            required: true
        }
    ],
    outputs: [
        {
            name: "HTML",
            type: task_1.TaskParamType.STRING
        },
        {
            name: "Web Page",
            type: task_1.TaskParamType.BROWSER_INSTANCE
        }
    ]
};
