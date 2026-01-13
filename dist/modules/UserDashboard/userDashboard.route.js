"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDashboardRoute = void 0;
const express_1 = require("express");
const userDashboard_controller_1 = require("./userDashboard.controller");
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("../User/user.constant");
const router = (0, express_1.Router)();
router.get('/stats', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN), userDashboard_controller_1.UserDashboardController.getUserStats);
exports.UserDashboardRoute = router;
