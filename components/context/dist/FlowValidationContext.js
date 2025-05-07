"use strict";
exports.__esModule = true;
exports.FlowValidationContextProvider = exports.FlowValidationContext = void 0;
var react_1 = require("react");
exports.FlowValidationContext = react_1.createContext(null);
function FlowValidationContextProvider(_a) {
    var children = _a.children;
    var _b = react_1.useState([]), invalidInputs = _b[0], setInvalidInputs = _b[1];
    var clearErrors = function () {
        setInvalidInputs([]);
    };
    return (react_1["default"].createElement(exports.FlowValidationContext.Provider, { value: {
            invalidInputs: invalidInputs,
            setInvalidInputs: setInvalidInputs,
            clearErrors: clearErrors
        } }, children));
}
exports.FlowValidationContextProvider = FlowValidationContextProvider;
