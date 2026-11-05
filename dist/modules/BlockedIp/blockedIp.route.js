"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockedIpRoutes = void 0;
const express_1 = __importDefault(require("express"));
const blockedIp_controller_1 = require("./blockedIp.controller");
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("../User/user.constant");
const router = express_1.default.Router();
// Admin only: Get all blocked IPs with pagination and search
router.get("/", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), blockedIp_controller_1.BlockedIpController.getAllBlockedIps);
// Admin only: Block a new IP or update existing block
router.post("/", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), blockedIp_controller_1.BlockedIpController.blockIp);
// Admin only: Unblock an IP by ID
router.delete("/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), blockedIp_controller_1.BlockedIpController.unblockIp);
exports.BlockedIpRoutes = router;
