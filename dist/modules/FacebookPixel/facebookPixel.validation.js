"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookPixelValidation = void 0;
const zod_1 = require("zod");
const updateFacebookPixelSchemaZod = zod_1.z.object({
    body: zod_1.z.object({
        pixelId: zod_1.z.string().optional(),
        accessToken: zod_1.z.string().optional(),
    }).refine(data => data.pixelId || data.accessToken, {
        message: "Either pixelId or accessToken must be provided"
    })
});
exports.FacebookPixelValidation = {
    updateFacebookPixelSchemaZod
};
