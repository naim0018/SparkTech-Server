import { Router } from "express";
import validateRequest from "../../app/middleware/validateRequest";
import { OrderController } from "./orders.controller";
import { OrderZodValidation } from "./orders.validation";

const router = Router();

router.get('/', OrderController.getAllOrders);
router.post('/create-order', validateRequest(OrderZodValidation.orderSchemaZod), OrderController.createOrder);
router.get('/:id', OrderController.getOrderById);
router.patch('/:id', validateRequest(OrderZodValidation.updateOrderSchemaZod.innerType()), OrderController.updateOrderById);
router.delete('/:id/delete-order', OrderController.deleteOrderById);

export const OrderRoute = router;
