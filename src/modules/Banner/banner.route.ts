import { Router } from "express";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";
import { bannerController } from "./banner.controller";

const router = Router();

// Public route for storefront displays
router.get("/", bannerController.getAllBanners);

// Admin-only management routes
router.post(
  "/create-banner",
  auth(USER_ROLE.ADMIN as "admin"),
  bannerController.createBanner
);
router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN as "admin"),
  bannerController.updateBanner
);
router.delete(
  "/:id",
  auth(USER_ROLE.ADMIN as "admin"),
  bannerController.deleteBanner
);

export const bannerRoutes = router;
