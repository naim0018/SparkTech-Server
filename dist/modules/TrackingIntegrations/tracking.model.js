"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracking = exports.trackingSchema = void 0;
const mongoose_1 = require("mongoose");
const trackingSchema = new mongoose_1.Schema({
    googleAnalyticsId: { type: String, default: "" },
    facebookPixelId: { type: String, default: "" },
    facebookAccessToken: { type: String, default: "" },
    tiktokPixelId: { type: String, default: "" },
    gtmId: { type: String, default: "" },
    clarityId: { type: String, default: "" },
    searchConsoleVerificationCode: { type: String, default: "" },
    lookerStudioEmbedUrl: { type: String, default: "" },
    steadfastApiKey: { type: String, default: "" },
    steadfastSecretKey: { type: String, default: "" },
    steadfastEnabled: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.trackingSchema = trackingSchema;
exports.Tracking = (0, mongoose_1.model)("Tracking", trackingSchema);
