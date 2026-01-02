"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoute = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
router.get("/stats", dashboard_controller_1.DashboardController.getStats);
exports.DashboardRoute = router;
