"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("../User/user.constant");
const banner_controller_1 = require("./banner.controller");
const router = (0, express_1.Router)();
// Public route for storefront displays
router.get("/", banner_controller_1.bannerController.getAllBanners);
// Admin-only management routes
router.post("/create-banner", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), banner_controller_1.bannerController.createBanner);
router.patch("/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), banner_controller_1.bannerController.updateBanner);
router.delete("/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), banner_controller_1.bannerController.deleteBanner);
exports.bannerRoutes = router;
