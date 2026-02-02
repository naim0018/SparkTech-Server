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
exports.SettingsController = exports.deleteCustomTheme = exports.addCustomTheme = exports.updateActiveTheme = exports.getSettings = void 0;
const settings_service_1 = require("./settings.service");
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield settings_service_1.SettingsService.getSettings(req);
        res.status(200).json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.getSettings = getSettings;
const updateActiveTheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { themeId } = req.body;
        if (!themeId)
            throw new Error("Theme ID is required");
        const settings = yield settings_service_1.SettingsService.updateActiveTheme(req, themeId);
        res.status(200).json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});
exports.updateActiveTheme = updateActiveTheme;
const addCustomTheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const theme = req.body;
        // validation could go here
        const settings = yield settings_service_1.SettingsService.addCustomTheme(req, theme);
        res.status(200).json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});
exports.addCustomTheme = addCustomTheme;
const deleteCustomTheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const settings = yield settings_service_1.SettingsService.deleteCustomTheme(req, id);
        res.status(200).json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});
exports.deleteCustomTheme = deleteCustomTheme;
exports.SettingsController = {
    getSettings: exports.getSettings,
    updateActiveTheme: exports.updateActiveTheme,
    addCustomTheme: exports.addCustomTheme,
    deleteCustomTheme: exports.deleteCustomTheme
};
