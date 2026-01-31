import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Map frontend URLs to database names
const TENANT_MAP: Record<string, string> = {
  'https://bestbuy4ubd.com': 'SparkTek',
  'https://www.bestbuy4ubd.com': 'SparkTek',
  'http://localhost:5173': 'SparkTek', // Default for local development
  'http://localhost:5174': 'TopDealsBd',
  'https://spark-tech-seven.vercel.app': 'SparkTek',
  
  'https://topdealsbd.com': 'TopDealsBd',
  'https://www.topdealsbd.com': 'TopDealsBd',
};

// Extend Express Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenantDb?: mongoose.Connection;
      dbName?: string;
      bkashToken?: string;
    }
  }
}

export const tenantResolver = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || req.headers.referer;
  
  if (!origin) {
    // Default to SparkTek if no origin is provided
    req.dbName = 'SparkTek';
    req.tenantDb = mongoose.connection.useDb('SparkTek');
    return next();
  }

  // Remove trailing slash and query params for matching
  const cleanOrigin = origin.split('?')[0].replace(/\/$/, '');
  
  // Find matching tenant
  const dbName = TENANT_MAP[cleanOrigin] || 'SparkTek'; // Default fallback
  
  req.dbName = dbName;
  req.tenantDb = mongoose.connection.useDb(dbName);
  
  next();
};
