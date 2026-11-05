import express from "express";
import { SettingsController } from "./settings.controller";
import { tenantResolver } from "../../app/middleware/tenantResolver";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Public route to fetch settings (needed for storefront initialization)
router.get("/", tenantResolver, SettingsController.getSettings);

// Admin-only store customization routes
router.patch(
  "/theme",
  tenantResolver,
  auth(USER_ROLE.ADMIN as "admin"),
  SettingsController.updateActiveTheme
);
router.post(
  "/theme",
  tenantResolver,
  auth(USER_ROLE.ADMIN as "admin"),
  SettingsController.addCustomTheme
);
router.delete(
  "/theme/:id",
  tenantResolver,
  auth(USER_ROLE.ADMIN as "admin"),
  SettingsController.deleteCustomTheme
);
router.patch(
  "/admin-info",
  tenantResolver,
  auth(USER_ROLE.ADMIN as "admin"),
  upload.single("logo"),
  (req, res, next) => {
    if (req.file) {
      req.body.logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
    next();
  },
  SettingsController.updateAdminInfo
);

export const SettingsRoutes = router;
