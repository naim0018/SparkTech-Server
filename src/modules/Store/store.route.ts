import express from 'express';
import { StoreController } from './store.controller';
import { storeResolver } from '../../app/middleware/storeResolver';

const router = express.Router();

// Config route - storeResolver is now applied globally in the main router
router.get('/config', StoreController.getStoreConfig);

export const StoreRoutes = router;
