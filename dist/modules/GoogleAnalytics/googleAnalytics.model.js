"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAnalytics = void 0;
const mongoose_1 = require("mongoose");
const googleAnalyticsSchema = new mongoose_1.Schema({
    googleAnalyticsId: { type: String, default: "" },
}, {
    timestamps: true
});
exports.GoogleAnalytics = (0, mongoose_1.model)('GoogleAnalytics', googleAnalyticsSchema);
