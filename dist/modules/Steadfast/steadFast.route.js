"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SteadfastRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("../User/user.constant");
const steadfast_controller_1 = require("./steadfast.controller");
const router = (0, express_1.Router)();
// Admin-only courier integration endpoints
router.post("/create-order", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), steadfast_controller_1.SteadfastController.createOrder);
router.post("/bulk-create-order", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), steadfast_controller_1.SteadfastController.bulkCreateOrder);
router.post("/status/bulk", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), steadfast_controller_1.SteadfastController.bulkCheckDeliveryStatus);
router.get("/status/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), steadfast_controller_1.SteadfastController.checkDeliveryStatus);
router.get("/balance", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), steadfast_controller_1.SteadfastController.getCurrentBalance);
router.get("/return-requests", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), steadfast_controller_1.SteadfastController.getReturnRequests);
router.get("/police-stations", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), steadfast_controller_1.SteadfastController.getPoliceStations);
exports.SteadfastRoutes = router;
