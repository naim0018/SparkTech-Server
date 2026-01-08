import { Router } from "express";
import validateRequest from "../../app/middleware/validateRequest";
import { facebookPixelController } from "./facebookPixel.controller";
import { FacebookPixelValidation } from "./facebookPixel.validation";
import auth from "../../app/middleware/auth";

const router = Router();

router.get('/', facebookPixelController.getFacebookPixel);
router.post('/', validateRequest(FacebookPixelValidation.updateFacebookPixelSchemaZod), facebookPixelController.createFacebookPixel);
router.patch('/', validateRequest(FacebookPixelValidation.updateFacebookPixelSchemaZod), facebookPixelController.updateFacebookPixel);
router.delete('/', facebookPixelController.deleteFacebookPixel);

export const FacebookPixelRoutes = router;
