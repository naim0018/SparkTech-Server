import { Router } from "express";
import validateRequest from "../../app/middleware/validateRequest";
import { googleAnalyticsController } from "./googleAnalytics.controller";
import { GoogleAnalyticsValidation } from "./googleAnalytics.validation";
import auth from "../../app/middleware/auth";

const router = Router();

router.get('/', googleAnalyticsController.getGoogleAnalytics);
router.post('/', validateRequest(GoogleAnalyticsValidation.updateGoogleAnalyticsSchemaZod), googleAnalyticsController.createGoogleAnalytics);
router.patch('/', validateRequest(GoogleAnalyticsValidation.updateGoogleAnalyticsSchemaZod), googleAnalyticsController.updateGoogleAnalytics);
router.delete('/', googleAnalyticsController.deleteGoogleAnalytics);

export const GoogleAnalyticsRoutes = router;
