"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModel = void 0;
const mongoose_1 = require("mongoose");
const ThemeVariablesSchema = new mongoose_1.Schema({
    "--color-brand-50": { type: String, required: true },
    "--color-brand-100": { type: String, required: true },
    "--color-brand-200": { type: String, required: true },
    "--color-brand-500": { type: String, required: true },
    "--color-brand-600": { type: String, required: true },
    "--color-brand-700": { type: String, required: true },
    "--color-brand-shadow": { type: String, required: true },
}, { _id: false });
const ThemeSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    previewColor: { type: String, required: true },
    isPreset: { type: Boolean, default: false },
    className: { type: String },
    variables: { type: ThemeVariablesSchema, required: true },
}, { _id: false });
const SettingsSchema = new mongoose_1.Schema({
    activeThemeId: { type: String, default: "default" },
    themes: { type: [ThemeSchema], default: [] }, // Defaults will be handled in service or seeding
}, { timestamps: true });
exports.SettingsModel = (0, mongoose_1.model)("Settings", SettingsSchema);
