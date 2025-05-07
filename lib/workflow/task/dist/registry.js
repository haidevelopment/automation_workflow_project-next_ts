"use strict";
exports.__esModule = true;
exports.TaskRegistry = void 0;
var ExtractTextFromElement_1 = require("./ExtractTextFromElement");
var LauchBrowser_1 = require("./LauchBrowser");
var PageToHtml_1 = require("./PageToHtml");
exports.TaskRegistry = {
    LAUCH_BROWSER: LauchBrowser_1.LaunchBrowserTask,
    PAGE_TO_HTML: PageToHtml_1.PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElement_1.ExtractTextFromElementTask
};
