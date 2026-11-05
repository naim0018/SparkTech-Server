import { Router } from "express";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";
import { SteadfastController } from "./steadfast.controller";

const router = Router();

// Admin-only courier integration endpoints
router.post(
  "/create-order",
  auth(USER_ROLE.ADMIN as "admin"),
  SteadfastController.createOrder
);
router.post(
  "/bulk-create-order",
  auth(USER_ROLE.ADMIN as "admin"),
  SteadfastController.bulkCreateOrder
);
router.post(
  "/status/bulk",
  auth(USER_ROLE.ADMIN as "admin"),
  SteadfastController.bulkCheckDeliveryStatus
);
router.get(
  "/status/:id",
  auth(USER_ROLE.ADMIN as "admin"),
  SteadfastController.checkDeliveryStatus
);
router.get(
  "/balance",
  auth(USER_ROLE.ADMIN as "admin"),
  SteadfastController.getCurrentBalance
);
router.get(
  "/return-requests",
  auth(USER_ROLE.ADMIN as "admin"),
  SteadfastController.getReturnRequests
);
router.get(
  "/police-stations",
  auth(USER_ROLE.ADMIN as "admin"),
  SteadfastController.getPoliceStations
);

export const SteadfastRoutes = router;
