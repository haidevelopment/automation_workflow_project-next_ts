"use strict";
exports.__esModule = true;
exports.CreateFlowNode = void 0;
function CreateFlowNode(nodeType, position) {
    return {
        id: crypto.randomUUID(),
        type: "FlowScrapeNode",
        dragHandle: ".drag-handle",
        data: {
            type: nodeType,
            inputs: {}
        },
        position: position !== null && position !== void 0 ? position : { x: 0, y: 0 }
    };
}
exports.CreateFlowNode = CreateFlowNode;
