"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websiteEventSchema = void 0;
const mongoose_1 = require("mongoose");
exports.websiteEventSchema = new mongoose_1.Schema({
    event: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    path: { type: String, required: true },
    ip: { type: String, default: "127.0.0.1", index: true },
    device: { type: String, enum: ["Mobile", "Tablet", "Desktop"], default: "Desktop" },
    payload: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    user: {
        name: { type: String },
        email: { type: String },
    },
    referrer: { type: String, default: "" },
    userAgent: { type: String, default: "" },
}, {
    timestamps: true,
});
// Compound index for fast tenant query with pagination by event and timestamp
exports.websiteEventSchema.index({ event: 1, createdAt: -1 });
exports.websiteEventSchema.index({ createdAt: -1 });
