"use server";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.RunWorkflow = void 0;
var prisma_1 = require("@/lib/prisma");
var executionPlan_1 = require("@/lib/workflow/executionPlan");
var registry_1 = require("@/lib/workflow/task/registry");
var workflow_1 = require("@/types/workflow");
var server_1 = require("@clerk/nextjs/server");
function RunWorkflow(form) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, workflowId, flowDefinition, workflow, executionPlan, flow, result, execution;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, server_1.auth()];
                case 1:
                    userId = (_a.sent()).userId;
                    if (!userId) {
                        throw new Error("unatuthenticated");
                    }
                    workflowId = form.workflowId, flowDefinition = form.flowDefinition;
                    if (!workflowId) {
                        throw new Error("WorklflowId is required ");
                    }
                    return [4 /*yield*/, prisma_1["default"].workflow.findUnique({
                            where: {
                                id: workflowId,
                                userId: userId
                            }
                        })];
                case 2:
                    workflow = _a.sent();
                    if (!flowDefinition) {
                        throw new Error("flow denfinition is not defined");
                    }
                    flow = JSON.parse(flowDefinition);
                    result = executionPlan_1.FlowToExecutionPlan(flow.nodes, flow.edges);
                    if (result.error) {
                        throw new Error("flow definition not invalid ");
                    }
                    if (!result.executionPlan) {
                        throw new Error("No execution plan generated");
                    }
                    executionPlan = result.executionPlan;
                    return [4 /*yield*/, prisma_1["default"].workflowExecution.create({
                            data: {
                                workflowId: workflowId,
                                userId: userId,
                                status: workflow_1.WorkflowExecutionStatus.PENDING,
                                startedAt: new Date(),
                                strigger: workflow_1.WorkflowExecutionTrigger.MANUAL,
                                phases: {
                                    create: executionPlan.flatMap(function (phase) {
                                        return phase.nodes.flatMap(function (node) {
                                            return {
                                                userId: userId,
                                                status: workflow_1.ExecutionPhaseStatus.CREATED,
                                                number: phase.phase,
                                                node: JSON.stringify(node),
                                                name: registry_1.TaskRegistry[node.data.type].label
                                            };
                                        });
                                    })
                                }
                            },
                            select: {
                                id: true,
                                phases: true
                            }
                        })];
                case 3:
                    execution = _a.sent();
                    if (!execution) {
                        throw new Error("workflow execution not create");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.RunWorkflow = RunWorkflow;
