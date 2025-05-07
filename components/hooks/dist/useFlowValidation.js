"use strict";
exports.__esModule = true;
var react_1 = require("react");
var FlowValidationContext_1 = require("../context/FlowValidationContext");
function useFlowValidation() {
    var context = react_1.useContext(FlowValidationContext_1.FlowValidationContext);
    if (!context) {
        throw new Error("UseFlowValidation must be used within a FlowValidationContext");
    }
    return context;
}
exports["default"] = useFlowValidation;
