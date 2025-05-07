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
exports.WorkflowTask = exports.satisfies = exports.LaunchBrowserTask = void 0;
var task_1 = require("@/types/task");
var lucide_react_1 = require("lucide-react");
exports.LaunchBrowserTask = {
    type: task_1.TaskType.LAUCH_BROWSER,
    label: "Launch Browser",
    icon: function (props) { return (React.createElement(lucide_react_1.GlobeIcon, __assign({ className: "stroke-pink-400" }, props))); },
    isEntryPoint: true,
    credits: 5,
    inputs: [
        {
            name: "Website Url",
            type: task_1.TaskParamType.STRING,
            helperText: "eg: https://www.google.com",
            required: true,
            hideHandle: true
        }
    ],
    outputs: [{
            name: "Web Page",
            type: task_1.TaskParamType.BROWSER_INSTANCE
        }]
};
