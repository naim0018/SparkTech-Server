import { Router } from "express";
import validateRequest from "../../app/middleware/validateRequest";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";
import { OrderController } from "./orders.controller";
import { OrderZodValidation } from "./orders.validation";

const router = Router();

// Public routes for customers
router.post(
  "/create-order",
  validateRequest(OrderZodValidation.orderSchemaZod),
  OrderController.createOrder
);
router.get("/track-order", OrderController.trackOrder);
router.get("/:id", OrderController.getOrderById);

// Admin-only routes for store management
router.get("/", auth(USER_ROLE.ADMIN as "admin"), OrderController.getAllOrders);
router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN as "admin"),
  validateRequest(OrderZodValidation.updateOrderSchemaZod.innerType()),
  OrderController.updateOrderById
);
router.delete(
  "/:id/delete-order",
  auth(USER_ROLE.ADMIN as "admin"),
  OrderController.deleteOrderById
);

export const OrderRoute = router;
