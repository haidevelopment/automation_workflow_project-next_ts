"use strict";
exports.__esModule = true;
exports.workflowSchema = void 0;
var zod_1 = require("zod");
exports.workflowSchema = zod_1.z.object({
    name: zod_1.z.string().max(50),
    description: zod_1.z.string().max(80).optional()
});
