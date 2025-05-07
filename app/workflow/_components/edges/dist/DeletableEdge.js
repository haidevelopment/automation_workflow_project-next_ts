"use client";
"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var react_1 = require("@xyflow/react");
function DeletableEdge(props) {
    var _a = react_1.getSimpleBezierPath(props), edgePath = _a[0], labelX = _a[1], labelY = _a[2];
    var setEdges = react_1.useReactFlow().setEdges;
    return React.createElement(React.Fragment, null,
        React.createElement(react_1.BaseEdge, { path: edgePath, markerEnd: props.markerEnd, style: props.style }),
        React.createElement(react_1.EdgeLabelRenderer, null,
            React.createElement("div", { style: {
                    position: "absolute",
                    transform: "translate(-50%,-50%) translate(" + labelX + "px," + labelY + "px)",
                    pointerEvents: "all"
                }, onClick: function () {
                    setEdges(function (eds) { return eds.filter(function (ed) { return ed.id !== props.id; }); });
                } },
                React.createElement(button_1.Button, { variant: "outline", size: "icon", className: "w-5 h-5 border cursor-pointer rounded-full text-xs leading-none hover:shadow-lg" }, "X"))));
}
exports["default"] = DeletableEdge;
