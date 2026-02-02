"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = exports.bannerSchema = void 0;
const mongoose_1 = require("mongoose");
const bannerSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    title: { type: String },
    subtitle: { type: String },
    description: { type: String },
    link: { type: String },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    buttonText: { type: String },
    buttonBgColor: { type: String },
    buttonTextColor: { type: String },
    textColor: { type: String },
    textPosition: { type: String, default: 'center' },
    titleSize: { type: String },
    subtitleSize: { type: String },
    showButton: { type: Boolean, default: true },
    showTitle: { type: Boolean, default: true }
}, {
    timestamps: true
});
exports.bannerSchema = bannerSchema;
exports.Banner = (0, mongoose_1.model)('Banner', bannerSchema);
