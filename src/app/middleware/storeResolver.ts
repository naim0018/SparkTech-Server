import { Request, Response, NextFunction } from 'express';
import { StoreModel } from '../../modules/Store/store.model';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      store?: any; // Using any for now, should be IStore
    }
  }
}

export const storeResolver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = req.hostname;
    // For development, you might want to map 'localhost' to a specific store manually if not in DB
    // or rely on a query param/header for testing: req.headers['x-store-domain']

    const domain = req.headers['x-store-domain'] as string || host;

    const store = await StoreModel.findOne({ domains: domain, isActive: true });

    if (!store) {
      // Fallback for development if needed, or error
       if (domain === 'localhost') {
           const devStore = await StoreModel.findOne({ name: 'BestBuy4uBd' });
           if(devStore) {
               req.store = devStore;
               return next();
           }
       }
      return res.status(404).json({
        success: false,
        message: 'Store not found for this domain',
      });
    }

    req.store = store;
    next();
  } catch (error) {
    next(error);
  }
};
