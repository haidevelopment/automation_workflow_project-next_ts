"use strict";
exports.__esModule = true;
var react_1 = require("react");
var NodeCard_1 = require("./NodeCard");
var NodeHeader_1 = require("./NodeHeader");
var NodeInputs_1 = require("./NodeInputs");
var registry_1 = require("@/lib/workflow/task/registry");
var NodeOutputs_1 = require("./NodeOutputs");
var badge_1 = require("@/components/ui/badge");
var DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
var NodeComponent = react_1.memo(function (props) {
    var nodeData = props.data;
    var task = registry_1.TaskRegistry[nodeData.type];
    return (React.createElement(NodeCard_1["default"], { nodeId: props.id, isSelected: props.selected },
        DEV_MODE && React.createElement(badge_1.Badge, null,
            "DEV: ",
            props.id),
        React.createElement(NodeHeader_1["default"], { taskType: nodeData.type, nodeId: props.id }),
        React.createElement(NodeInputs_1.NodeInputs, null, task.inputs.map(function (input) { return (React.createElement(NodeInputs_1.NodeInput, { key: input.name, input: input, nodeId: props.id })); })),
        React.createElement(NodeOutputs_1.NodeOutputs, null, task.outputs.map(function (output) { return (React.createElement(NodeOutputs_1.NodeOutput, { key: output.name, output: output, nodeId: props.id })); }))));
});
exports["default"] = NodeComponent;
NodeComponent.displayName = "NodeComponent";
