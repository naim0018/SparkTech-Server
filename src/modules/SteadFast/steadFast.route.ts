import { Router } from "express";
import { SteadFastController } from "./steadFast.controller";

const router = Router();

router.post(
    '/create-order',
    SteadFastController.createOrder
);

router.get(
    '/get-city',
    SteadFastController.getCity
);

router.get(
    '/get-zone',
    SteadFastController.getZone
);

router.get(
    '/track-parcel/:consignment',
    SteadFastController.trackParcel
);

export const SteadFastRoute = router;
