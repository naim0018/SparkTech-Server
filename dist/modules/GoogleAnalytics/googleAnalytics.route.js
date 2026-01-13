"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAnalyticsRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../app/middleware/validateRequest"));
const googleAnalytics_controller_1 = require("./googleAnalytics.controller");
const googleAnalytics_validation_1 = require("./googleAnalytics.validation");
const router = (0, express_1.Router)();
router.get('/', googleAnalytics_controller_1.googleAnalyticsController.getGoogleAnalytics);
router.post('/', (0, validateRequest_1.default)(googleAnalytics_validation_1.GoogleAnalyticsValidation.updateGoogleAnalyticsSchemaZod), googleAnalytics_controller_1.googleAnalyticsController.createGoogleAnalytics);
router.patch('/', (0, validateRequest_1.default)(googleAnalytics_validation_1.GoogleAnalyticsValidation.updateGoogleAnalyticsSchemaZod), googleAnalytics_controller_1.googleAnalyticsController.updateGoogleAnalytics);
router.delete('/', googleAnalytics_controller_1.googleAnalyticsController.deleteGoogleAnalytics);
exports.GoogleAnalyticsRoutes = router;
