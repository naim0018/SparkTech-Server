import { Router } from "express";
import { SteadfastController } from "./steadfast.controller";

const router = Router();

router.post("/create-order", SteadfastController.createOrder);
router.post("/bulk-create-order", SteadfastController.bulkCreateOrder);
router.post("/status/bulk", SteadfastController.bulkCheckDeliveryStatus);
router.get("/status/:id", SteadfastController.checkDeliveryStatus);
router.get("/balance", SteadfastController.getCurrentBalance);
router.get("/return-requests", SteadfastController.getReturnRequests);
router.get("/police-stations", SteadfastController.getPoliceStations);

export const SteadfastRoutes = router;
