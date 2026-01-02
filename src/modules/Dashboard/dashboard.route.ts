import { Router } from "express";
import { DashboardController } from "./dashboard.controller";

const router = Router();

router.get("/stats", DashboardController.getStats);

export const DashboardRoute = router;
