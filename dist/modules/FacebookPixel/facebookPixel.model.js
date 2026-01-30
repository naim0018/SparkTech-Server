"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookPixel = exports.facebookPixelSchema = void 0;
const mongoose_1 = require("mongoose");
const facebookPixelSchema = new mongoose_1.Schema({
    pixelId: { type: String, default: "" },
    accessToken: { type: String, default: "" },
}, {
    timestamps: true
});
exports.facebookPixelSchema = facebookPixelSchema;
exports.FacebookPixel = (0, mongoose_1.model)('FacebookPixel', facebookPixelSchema);
