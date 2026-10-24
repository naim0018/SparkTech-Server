"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsDashboardRoutes = void 0;
const express_1 = __importDefault(require("express"));
const analyticsDashboard_controller_1 = require("./analyticsDashboard.controller");
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("../User/user.constant");
const router = express_1.default.Router();
// Public: Log an event from any storefront/landing page visitor
router.post("/store-activity", analyticsDashboard_controller_1.AnalyticsDashboardController.logEvent);
// Admin: Get paginated events and summary metrics
router.get("/store-activity", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), analyticsDashboard_controller_1.AnalyticsDashboardController.getEvents);
// Admin: Clear events for this tenant
router.delete("/store-activity", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), analyticsDashboard_controller_1.AnalyticsDashboardController.clearEvents);
// Admin: GA4 Dashboard Data
router.get("/dashboard", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), analyticsDashboard_controller_1.AnalyticsDashboardController.getDashboardData);
exports.AnalyticsDashboardRoutes = router;
