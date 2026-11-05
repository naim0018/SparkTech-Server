"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("../User/user.constant");
const tracking_controller_1 = require("./tracking.controller");
const router = (0, express_1.Router)();
// Public route to fetch tracking settings (needed for storefront GTM, GA4, Pixels initialization)
router.get("/", tracking_controller_1.TrackingController.getTrackingSettings);
// Admin-only tracking configuration endpoints
router.patch("/update", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), tracking_controller_1.TrackingController.updateTrackingSettings);
exports.TrackingRoutes = router;
