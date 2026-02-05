"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = exports.deleteCustomTheme = exports.addCustomTheme = exports.updateActiveTheme = exports.getSettings = void 0;
const settings_model_1 = require("./settings.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
// Default presets to initialize if none exist
const DEFAULT_THEMES = [
    {
        id: "default",
        name: "Indigo",
        previewColor: "#6366f1",
        isPreset: true,
        className: "",
        variables: {
            '--brand-50': '#eef2ff',
            '--brand-100': '#e0e7ff',
            '--brand-200': '#c7d2fe',
            '--brand-500': '#6366f1',
            '--brand-600': '#4f46e5',
            '--brand-700': '#4338ca',
            '--brand-shadow': 'rgba(79, 70, 229, 0.15)'
        }
    },
    {
        id: "emerald",
        name: "Emerald",
        previewColor: "#10b981",
        isPreset: true,
        className: "theme-emerald",
        variables: {
            '--brand-50': '#ecfdf5',
            '--brand-100': '#d1fae5',
            '--brand-200': '#a7f3d0',
            '--brand-500': '#10b981',
            '--brand-600': '#059669',
            '--brand-700': '#047857',
            '--brand-shadow': 'rgba(5, 150, 105, 0.15)'
        }
    },
    {
        id: "rose",
        name: "Rose",
        previewColor: "#f43f5e",
        isPreset: true,
        className: "theme-rose",
        variables: {
            '--brand-50': '#fff1f2',
            '--brand-100': '#ffe4e6',
            '--brand-200': '#fecdd3',
            '--brand-500': '#f43f5e',
            '--brand-600': '#e11d48',
            '--brand-700': '#be123c',
            '--brand-shadow': 'rgba(225, 29, 72, 0.15)'
        }
    },
    {
        id: "violet",
        name: "Violet",
        previewColor: "#8b5cf6",
        isPreset: true,
        className: "theme-violet",
        variables: {
            '--brand-50': '#f5f3ff',
            '--brand-100': '#ede9fe',
            '--brand-200': '#ddd6fe',
            '--brand-500': '#8b5cf6',
            '--brand-600': '#7c3aed',
            '--brand-700': '#6d28d9',
            '--brand-shadow': 'rgba(124, 58, 237, 0.15)'
        }
    },
    {
        id: "amber",
        name: "Amber",
        previewColor: "#f59e0b",
        isPreset: true,
        className: "theme-amber",
        variables: {
            '--brand-50': '#fffbeb',
            '--brand-100': '#fef3c7',
            '--brand-200': '#fde68a',
            '--brand-500': '#f59e0b',
            '--brand-600': '#d97706',
            '--brand-700': '#b45309',
            '--brand-shadow': 'rgba(217, 119, 6, 0.15)'
        }
    }
];
const getSettings = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const Settings = (0, getTenantModel_1.getTenantModel)(req, 'Settings', settings_model_1.SettingsModel.schema);
    let settings = yield Settings.findOne();
    if (!settings) {
        settings = yield Settings.create({
            activeThemeId: 'default',
            themes: DEFAULT_THEMES
        });
    }
    // Ensure default themes always exist (in case of updates)
    // Logic could be added here to merge DEFAULT_THEMES if missing
    return settings;
});
exports.getSettings = getSettings;
const updateActiveTheme = (req, themeId) => __awaiter(void 0, void 0, void 0, function* () {
    const Settings = (0, getTenantModel_1.getTenantModel)(req, 'Settings', settings_model_1.SettingsModel.schema);
    const settings = yield Settings.findOne();
    if (!settings)
        throw new Error("Settings not initialized");
    const themeExists = settings.themes.some(t => t.id === themeId);
    if (!themeExists)
        throw new Error("Theme not found");
    settings.activeThemeId = themeId;
    yield settings.save();
    return settings;
});
exports.updateActiveTheme = updateActiveTheme;
const addCustomTheme = (req, theme) => __awaiter(void 0, void 0, void 0, function* () {
    const Settings = (0, getTenantModel_1.getTenantModel)(req, 'Settings', settings_model_1.SettingsModel.schema);
    const settings = yield (0, exports.getSettings)(req);
    // Prevent duplicate IDs
    if (settings.themes.some(t => t.id === theme.id)) {
        throw new Error("Theme ID already exists");
    }
    settings.themes.push(theme);
    yield settings.save();
    return settings;
});
exports.addCustomTheme = addCustomTheme;
const deleteCustomTheme = (req, themeId) => __awaiter(void 0, void 0, void 0, function* () {
    const Settings = (0, getTenantModel_1.getTenantModel)(req, 'Settings', settings_model_1.SettingsModel.schema);
    const settings = yield (0, exports.getSettings)(req);
    const themeIndex = settings.themes.findIndex(t => t.id === themeId);
    if (themeIndex === -1)
        throw new Error("Theme not found");
    if (settings.themes[themeIndex].isPreset) {
        throw new Error("Cannot delete preset themes");
    }
    settings.themes.splice(themeIndex, 1);
    // Reset to default if active theme was deleted
    if (settings.activeThemeId === themeId) {
        settings.activeThemeId = 'default';
    }
    yield settings.save();
    return settings;
});
exports.deleteCustomTheme = deleteCustomTheme;
exports.SettingsService = {
    getSettings: exports.getSettings,
    updateActiveTheme: exports.updateActiveTheme,
    addCustomTheme: exports.addCustomTheme,
    deleteCustomTheme: exports.deleteCustomTheme
};
