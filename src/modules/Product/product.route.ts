import { Router } from "express";
import validateRequest from "../../app/middleware/validateRequest";
import { ProductController } from "./product.controller";
import { ProductZodValidation } from "./product.validation";

const router= Router()

router.get('/',ProductController.getAllProduct)
router.post('/add-product',validateRequest(ProductZodValidation.productSchemaZod),ProductController.addProduct)

export const ProductRoute = router