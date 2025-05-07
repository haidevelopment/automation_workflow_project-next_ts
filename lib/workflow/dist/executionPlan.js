"use strict";
exports.__esModule = true;
exports.FlowToExecutionPlan = exports.FlowToExecutionPlanValidationError = void 0;
var registry_1 = require("./task/registry");
var FlowToExecutionPlanValidationError;
(function (FlowToExecutionPlanValidationError) {
    FlowToExecutionPlanValidationError[FlowToExecutionPlanValidationError["NO_ENTRY_POINT"] = 0] = "NO_ENTRY_POINT";
    FlowToExecutionPlanValidationError[FlowToExecutionPlanValidationError["INVALID_INPUTS"] = 1] = "INVALID_INPUTS";
})(FlowToExecutionPlanValidationError = exports.FlowToExecutionPlanValidationError || (exports.FlowToExecutionPlanValidationError = {}));
function FlowToExecutionPlan(nodes, edges) {
    var entryPoint = nodes.find(function (node) { return registry_1.TaskRegistry[node.data.type].isEntryPoint; });
    if (!entryPoint) {
        return {
            error: {
                type: FlowToExecutionPlanValidationError.NO_ENTRY_POINT
            }
        };
    }
    var inputsWithErrors = [];
    var planned = new Set();
    var invalidInputs = getInvalidInputs(entryPoint, edges, planned);
    if (invalidInputs.length > 0) {
        inputsWithErrors.push({
            nodeId: entryPoint.id,
            inputs: invalidInputs
        });
    }
    var executionPlan = [
        { phase: 1, nodes: [entryPoint] }
    ];
    planned.add(entryPoint.id);
    for (var phase = 2; phase <= nodes.length && planned.size < nodes.length; phase++) {
        var nextPhase = { phase: phase, nodes: [] };
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var currentNode = nodes_1[_i];
            if (planned.has(currentNode.id)) {
                //node already put in the execution plan
                continue;
            }
            var invalidInputs_1 = getInvalidInputs(currentNode, edges, planned);
            if (invalidInputs_1.length > 0) {
                var incomers = getIncomers(currentNode, nodes, edges);
                if (incomers.every(function (incomer) { return planned.has(incomer.id); })) {
                    // if all incoming incormer/edges are planned and there are still invalid inputs
                    //this mean that this particular node has and invalid input
                    //which mean that the workflow is invalid
                    console.log("invalid input", currentNode.id, invalidInputs_1);
                    inputsWithErrors.push({
                        nodeId: currentNode.id,
                        inputs: invalidInputs_1
                    });
                }
                else {
                    continue;
                }
            }
            nextPhase.nodes.push(currentNode);
        }
        for (var _a = 0, _b = nextPhase.nodes; _a < _b.length; _a++) {
            var node = _b[_a];
            planned.add(node.id);
        }
        executionPlan === null || executionPlan === void 0 ? void 0 : executionPlan.push(nextPhase);
    }
    if (inputsWithErrors.length > 0) {
        return {
            error: {
                type: FlowToExecutionPlanValidationError.INVALID_INPUTS,
                invalidElements: inputsWithErrors
            }
        };
    }
    return { executionPlan: executionPlan };
}
exports.FlowToExecutionPlan = FlowToExecutionPlan;
function getInvalidInputs(node, edges, planned) {
    var _a, _b;
    var invalidInputs = [];
    var inputs = (_b = registry_1.TaskRegistry[(_a = node === null || node === void 0 ? void 0 : node.data) === null || _a === void 0 ? void 0 : _a.type]) === null || _b === void 0 ? void 0 : _b.inputs;
    var _loop_1 = function (input) {
        var inputValue = node.data.inputs[input.name];
        var inputValueProvided = (inputValue === null || inputValue === void 0 ? void 0 : inputValue.length) > 0;
        if (inputValueProvided) {
            return "continue";
        }
        var incommingEdges = edges.filter(function (edge) { return edge.target === node.id; });
        var inputEdgeLinkedToOutput = incommingEdges.find(function (edge) { return edge.targetHandle == input.name; });
        var requireInputProvidedByVisitedOuput = input.required && inputEdgeLinkedToOutput && planned.has(inputEdgeLinkedToOutput.source);
        if (requireInputProvidedByVisitedOuput) {
            return "continue";
        }
        else if (!input.required) {
            if (!inputEdgeLinkedToOutput)
                return "continue";
            if (inputEdgeLinkedToOutput && planned.has(inputEdgeLinkedToOutput.source)) {
                return "continue";
            }
        }
        invalidInputs.push(input.name);
    };
    for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
        var input = inputs_1[_i];
        _loop_1(input);
    }
    return invalidInputs;
}
function getIncomers(node, nodes, edges) {
    if (!node.id) {
        return [];
    }
    var incomersIds = new Set();
    edges.forEach(function (edge) {
        if (edge.target === node.id) {
            incomersIds.add(edge.source);
        }
    });
    return nodes.filter(function (n) { return incomersIds.has(n.id); });
}
