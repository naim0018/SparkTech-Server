import { Router } from "express";
import { TrackingController } from "./tracking.controller";

const router = Router();

router.get("/", TrackingController.getTrackingSettings);
router.patch("/update", TrackingController.updateTrackingSettings);

export const TrackingRoutes = router;
