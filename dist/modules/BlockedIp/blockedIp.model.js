"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockedIpSchema = void 0;
const mongoose_1 = require("mongoose");
exports.blockedIpSchema = new mongoose_1.Schema({
    ip: {
        type: String,
        required: true,
        trim: true,
    },
    reason: {
        type: String,
        default: "Suspicious or abusive activity",
        trim: true,
    },
    scope: {
        type: String,
        enum: ["all", "checkout"],
        default: "all",
        required: true,
    },
    blockedBy: {
        type: String,
        default: "Admin",
    },
}, {
    timestamps: true,
});
// Unique per-tenant index for IP + Scope
exports.blockedIpSchema.index({ ip: 1 }, { unique: true });
