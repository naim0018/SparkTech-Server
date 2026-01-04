import { Router } from "express";
import { bannerController } from "./banner.controller";

const router = Router();

router.post('/create-banner', bannerController.createBanner);
router.get('/', bannerController.getAllBanners);
router.patch('/:id', bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

export const bannerRoutes = router;
