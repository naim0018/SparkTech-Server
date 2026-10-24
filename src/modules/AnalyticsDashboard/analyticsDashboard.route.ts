import express from "express";
import { AnalyticsDashboardController } from "./analyticsDashboard.controller";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";

const router = express.Router();

// Public: Log an event from any storefront/landing page visitor
router.post("/store-activity", AnalyticsDashboardController.logEvent);

// Admin: Get paginated events and summary metrics
router.get(
  "/store-activity",
  auth(USER_ROLE.ADMIN as 'ADMIN'),
  AnalyticsDashboardController.getEvents
);

// Admin: Clear events for this tenant
router.delete(
  "/store-activity",
  auth(USER_ROLE.ADMIN as 'ADMIN'),
  AnalyticsDashboardController.clearEvents
);

// Admin: GA4 Dashboard Data
router.get(
  "/dashboard",
  auth(USER_ROLE.ADMIN as 'ADMIN'),
  AnalyticsDashboardController.getDashboardData
);

export const AnalyticsDashboardRoutes = router;
