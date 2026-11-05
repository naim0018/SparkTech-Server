import express from "express";
import { BlockedIpController } from "./blockedIp.controller";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";

const router = express.Router();

// Admin only: Get all blocked IPs with pagination and search
router.get("/", auth(USER_ROLE.ADMIN as "ADMIN"), BlockedIpController.getAllBlockedIps);

// Admin only: Block a new IP or update existing block
router.post("/", auth(USER_ROLE.ADMIN as "ADMIN"), BlockedIpController.blockIp);

// Admin only: Unblock an IP by ID
router.delete("/:id", auth(USER_ROLE.ADMIN as "ADMIN"), BlockedIpController.unblockIp);

export const BlockedIpRoutes = router;
