"use client";
"use strict";
exports.__esModule = true;
exports.AppProviders = void 0;
var next_themes_1 = require("next-themes");
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var react_query_devtools_1 = require("@tanstack/react-query-devtools");
function AppProviders(_a) {
    var children = _a.children;
    var queryClient = react_1.useState(function () { return new react_query_1.QueryClient(); })[0];
    return (react_1["default"].createElement(react_query_1.QueryClientProvider, { client: queryClient },
        react_1["default"].createElement(next_themes_1.ThemeProvider, { attribute: "class", defaultTheme: "system", enableSystem: true }, children),
        react_1["default"].createElement(react_query_devtools_1.ReactQueryDevtools, null)));
}
exports.AppProviders = AppProviders;
