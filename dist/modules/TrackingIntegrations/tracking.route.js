"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingRoutes = void 0;
const express_1 = require("express");
const tracking_controller_1 = require("./tracking.controller");
const router = (0, express_1.Router)();
router.get("/", tracking_controller_1.TrackingController.getTrackingSettings);
router.patch("/update", tracking_controller_1.TrackingController.updateTrackingSettings);
exports.TrackingRoutes = router;
