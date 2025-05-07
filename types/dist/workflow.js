"use strict";
exports.__esModule = true;
exports.WorkflowExecutionTrigger = exports.WorkflowExecutionStatus = exports.ExecutionPhaseStatus = exports.WorkflowStatus = void 0;
var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["DRAF"] = "DRAF";
    WorkflowStatus["PUBLISHER"] = "PUBLISHER";
})(WorkflowStatus = exports.WorkflowStatus || (exports.WorkflowStatus = {}));
var ExecutionPhaseStatus;
(function (ExecutionPhaseStatus) {
    ExecutionPhaseStatus["CREATED"] = "CREATED";
    ExecutionPhaseStatus["PENDING"] = "PENDING";
    ExecutionPhaseStatus["RUNNING"] = "RUNNING";
    ExecutionPhaseStatus["COMPLETED"] = "COMPLETED";
    ExecutionPhaseStatus["FAILED"] = "FAILED";
})(ExecutionPhaseStatus = exports.ExecutionPhaseStatus || (exports.ExecutionPhaseStatus = {}));
var WorkflowExecutionStatus;
(function (WorkflowExecutionStatus) {
    WorkflowExecutionStatus["PENDING"] = "PENDING";
    WorkflowExecutionStatus["RUNNING"] = "RUNNING";
    WorkflowExecutionStatus["COMPLETED"] = "COMPLETED";
    WorkflowExecutionStatus["FAILED"] = "FAILED";
})(WorkflowExecutionStatus = exports.WorkflowExecutionStatus || (exports.WorkflowExecutionStatus = {}));
var WorkflowExecutionTrigger;
(function (WorkflowExecutionTrigger) {
    WorkflowExecutionTrigger["MANUAL"] = "MANUAL";
})(WorkflowExecutionTrigger = exports.WorkflowExecutionTrigger || (exports.WorkflowExecutionTrigger = {}));
