"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAnalyticsValidation = void 0;
const zod_1 = require("zod");
const updateGoogleAnalyticsSchemaZod = zod_1.z.object({
    body: zod_1.z.object({
        id: zod_1.z.string({
            required_error: "Google Analytics ID is required"
        }),
    })
});
exports.GoogleAnalyticsValidation = {
    updateGoogleAnalyticsSchemaZod
};
