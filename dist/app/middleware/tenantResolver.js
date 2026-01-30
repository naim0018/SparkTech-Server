"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantResolver = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Map frontend URLs to database names
const TENANT_MAP = {
    'https://bestbuy4ubd.com': 'SparkTek',
    'https://www.bestbuy4ubd.com': 'SparkTek',
    'http://localhost:5173': 'SparkTek', // Default for local development
    'http://localhost:5174': 'TopDealsBd',
    'https://spark-tech-seven.vercel.app': 'SparkTek',
    'https://topdealsbd.com': 'TopDealsBd',
    'https://www.topdealsbd.com': 'TopDealsBd',
};
const tenantResolver = (req, res, next) => {
    const origin = req.headers.origin || req.headers.referer;
    if (!origin) {
        // Default to SparkTek if no origin is provided
        req.dbName = 'SparkTek';
        req.tenantDb = mongoose_1.default.connection.useDb('SparkTek');
        return next();
    }
    // Remove trailing slash and query params for matching
    const cleanOrigin = origin.split('?')[0].replace(/\/$/, '');
    // Find matching tenant
    const dbName = TENANT_MAP[cleanOrigin] || 'SparkTek'; // Default fallback
    req.dbName = dbName;
    req.tenantDb = mongoose_1.default.connection.useDb(dbName);
    next();
};
exports.tenantResolver = tenantResolver;
