"use client";
"use strict";
exports.__esModule = true;
var utils_1 = require("@/lib/utils");
var react_1 = require("@xyflow/react");
var react_2 = require("react");
function NodeCard(_a) {
    var children = _a.children, nodeId = _a.nodeId, isSelected = _a.isSelected;
    var _b = react_1.useReactFlow(), getNode = _b.getNode, setCenter = _b.setCenter;
    return (react_2["default"].createElement("div", { onDoubleClick: function () {
            var node = getNode(nodeId);
            if (!node)
                return;
            var position = node.position, measured = node.measured;
            if (!position || !measured)
                return;
            var width = measured.width, height = measured.height;
            var x = position.x + width / 2;
            var y = position.y + height / 2;
            console.log("@POSITION", position);
            if (x === undefined || y === undefined)
                return;
            setCenter(x, y, {
                zoom: 1,
                duration: 500
            });
        }, className: utils_1.cn("rounded-md cursor-pointer bg-background border-2 border-separate w-[420px] text-xs gap-1 flex flex-col", isSelected && "border-primary") }, children));
}
exports["default"] = NodeCard;
