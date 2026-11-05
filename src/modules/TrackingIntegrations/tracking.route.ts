import { Router } from "express";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";
import { TrackingController } from "./tracking.controller";

const router = Router();

// Public route to fetch tracking settings (needed for storefront GTM, GA4, Pixels initialization)
router.get("/", TrackingController.getTrackingSettings);

// Admin-only tracking configuration endpoints
router.patch("/update", auth(USER_ROLE.ADMIN as "admin"), TrackingController.updateTrackingSettings);

export const TrackingRoutes = router;
