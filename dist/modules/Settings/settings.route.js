"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const settings_controller_1 = require("./settings.controller");
const tenantResolver_1 = require("../../app/middleware/tenantResolver");
const router = express_1.default.Router();
// Public route to fetch settings (needed for frontend initialization)
// Middleware tenantResolver ensures we connect to the right DB
router.get('/', tenantResolver_1.tenantResolver, settings_controller_1.SettingsController.getSettings);
// Admin routes - In real app, add Auth middleware here
router.patch('/theme', tenantResolver_1.tenantResolver, settings_controller_1.SettingsController.updateActiveTheme);
router.post('/theme', tenantResolver_1.tenantResolver, settings_controller_1.SettingsController.addCustomTheme);
router.delete('/theme/:id', tenantResolver_1.tenantResolver, settings_controller_1.SettingsController.deleteCustomTheme);
exports.SettingsRoutes = router;
