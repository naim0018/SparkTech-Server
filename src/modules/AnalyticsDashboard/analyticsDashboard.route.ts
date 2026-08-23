import express from "express";
import { AnalyticsDashboardController } from "./analyticsDashboard.controller";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";

const router = express.Router();

router.get(
  "/dashboard",
  auth(USER_ROLE.ADMIN as 'ADMIN'),
  AnalyticsDashboardController.getDashboardData
);

export const AnalyticsDashboardRoutes = router;
