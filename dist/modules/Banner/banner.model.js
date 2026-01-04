"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = require("mongoose");
const bannerSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    productId: { type: String, required: true }, // Store ID as string for flexibility, typically generic Product ID or link
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});
exports.Banner = (0, mongoose_1.model)('Banner', bannerSchema);
