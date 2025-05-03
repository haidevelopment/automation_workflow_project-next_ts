"use client";
"use strict";
exports.__esModule = true;
exports.MobileSidebar = void 0;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var Logo_1 = require("./Logo");
var link_1 = require("next/link");
var button_1 = require("./ui/button");
var navigation_1 = require("next/navigation");
var sheet_1 = require("./ui/sheet");
var routes = [
    {
        href: "",
        label: "Home",
        icon: lucide_react_1.HomeIcon
    },
    {
        href: "workflows",
        label: "Workflows",
        icon: lucide_react_1.Layers2Icon
    },
    {
        href: "credentials",
        label: "Credentials",
        icon: lucide_react_1.ShieldCheckIcon
    },
    {
        href: "billing",
        label: "Billing",
        icon: lucide_react_1.CoinsIcon
    },
];
function DesktopSidebar() {
    var pathName = navigation_1.usePathname();
    var active = routes.find(function (route) { return route.href.length > 0 && pathName.includes(route.href); }) || routes[0];
    return (react_1["default"].createElement("div", { className: "hidden relative md:block max-w-[280px] min-w-[280px] h-screen overflow-hidden w-full bg-primary/5 dark:bg-secondary/30 dark:text-foreground text-muted-foreground border-r-2 border-separate" },
        react_1["default"].createElement("div", { className: "flex items-center justify-center gap-2 border-b-[1px] border-separate p-4" },
            react_1["default"].createElement(Logo_1["default"], null)),
        react_1["default"].createElement("div", { className: "p-2" }, "TODO CREADITS"),
        react_1["default"].createElement("div", { className: "flex flex-col p-2 " }, routes === null || routes === void 0 ? void 0 : routes.map(function (route, index) { return (react_1["default"].createElement(link_1["default"], { key: index, href: route.href != "" ? route.href : "/", className: button_1.buttonVariants({
                variant: active.href === route.href ? "sidebarActiveItem" : "sidebarItem"
            }) },
            react_1["default"].createElement(route.icon, { size: 20 }),
            route.label)); }))));
}
function MobileSidebar() {
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var pathName = navigation_1.usePathname();
    var active = routes.find(function (route) { return route.href.length > 0 && pathName.includes(route.href); }) || routes[0];
    return (react_1["default"].createElement("div", { className: "block border-separate bg-background md:hidden" },
        react_1["default"].createElement("nav", { className: "container flex items-center justify-between px-8" },
            react_1["default"].createElement(sheet_1.Sheet, { open: isOpen, onOpenChange: setIsOpen },
                react_1["default"].createElement(sheet_1.SheetTrigger, { asChild: true },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon" },
                        react_1["default"].createElement(lucide_react_1.MenuIcon, null))),
                react_1["default"].createElement(sheet_1.SheetContent, { className: "w-[400px] sm:w-[540px] space-y-4", side: "left" },
                    react_1["default"].createElement(Logo_1["default"], null),
                    react_1["default"].createElement("div", { className: "flex flex-col p-2" }, routes === null || routes === void 0 ? void 0 : routes.map(function (route, index) { return (react_1["default"].createElement(link_1["default"], { key: index, href: route.href, className: button_1.buttonVariants({
                            variant: active.href == route.href
                                ? "sidebarActiveItem"
                                : "sidebarItem"
                        }), onClick: function () { return setIsOpen(function (prev) { return !prev; }); } },
                        react_1["default"].createElement(route.icon, { size: 20 }),
                        route.label)); })))))));
}
exports.MobileSidebar = MobileSidebar;
exports["default"] = DesktopSidebar;
