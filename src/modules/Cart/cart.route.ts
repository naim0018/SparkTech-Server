import { Router } from 'express';
import { CartController } from './cart.controller';

import validateRequest from '../../app/middleware/validateRequest';
import { validateCart } from './cart.validation';


const router = Router();

router.post('/cart', validateRequest(validateCart.cartSchema), CartController.addToCart);
router.get('/cart', CartController.getCart);
router.get('/cart/:id', CartController.getCartItemById);
router.put('/cart/:id', validateRequest(validateCart.updateCartSchema), CartController.updateCartItemById);
router.delete('/cart/:id', CartController.removeCartItemById);

export default router;
