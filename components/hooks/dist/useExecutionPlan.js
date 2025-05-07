"use strict";
exports.__esModule = true;
var executionPlan_1 = require("@/lib/workflow/executionPlan");
var react_1 = require("@xyflow/react");
var react_2 = require("react");
var useFlowValidation_1 = require("./useFlowValidation");
var sonner_1 = require("sonner");
var useExecutionPlan = function () {
    var toObject = react_1.useReactFlow().toObject;
    var _a = useFlowValidation_1["default"](), setInvalidInputs = _a.setInvalidInputs, clearErrors = _a.clearErrors;
    var handleError = react_2.useCallback(function (error) {
        switch (error.type) {
            case executionPlan_1.FlowToExecutionPlanValidationError.NO_ENTRY_POINT:
                sonner_1.toast.error("No entry point found ");
                break;
            case executionPlan_1.FlowToExecutionPlanValidationError.INVALID_INPUTS:
                sonner_1.toast.error("Not all inputs value are set");
                setInvalidInputs(error.invalidElements);
                break;
            default:
                sonner_1.toast.error("Something went wrong");
                break;
        }
    }, []);
    var generateExecutionPlan = react_2.useCallback(function () {
        var _a = toObject(), nodes = _a.nodes, edges = _a.edges;
        var _b = executionPlan_1.FlowToExecutionPlan(nodes, edges), executionPlan = _b.executionPlan, error = _b.error;
        if (error) {
            handleError(error);
            return null;
        }
        clearErrors();
        return executionPlan;
    }, [toObject, handleError, clearErrors]);
    return generateExecutionPlan;
};
exports["default"] = useExecutionPlan;
