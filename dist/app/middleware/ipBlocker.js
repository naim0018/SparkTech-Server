"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSiteIpBlock = exports.getBlockedIpRecord = exports.getTenantBlockedRecords = exports.invalidateTenantIpCache = exports.getClientIp = exports.isLoopbackIp = exports.isValidIp = exports.normalizeIp = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const getTenantModel_1 = require("../utils/getTenantModel");
const blockedIp_model_1 = require("../../modules/BlockedIp/blockedIp.model");
/**
 * Normalizes an IP address:
 * - Strips IPv4-mapped IPv6 prefix (::ffff:192.168.1.1 -> 192.168.1.1)
 * - Trims whitespace
 * - Strips any attached port number (e.g. 192.168.1.1:8080)
 */
const normalizeIp = (rawIp) => {
    if (!rawIp || typeof rawIp !== "string")
        return "127.0.0.1";
    let ip = rawIp.trim();
    // Strip IPv4-mapped IPv6 prefix
    if (ip.startsWith("::ffff:")) {
        ip = ip.substring(7);
    }
    // Handle port if attached in proxy headers (IPv4 with port)
    if (/^(\d{1,3}\.){3}\d{1,3}:\d+$/.test(ip)) {
        ip = ip.split(":")[0];
    }
    return ip;
};
exports.normalizeIp = normalizeIp;
/**
 * Helper to check whether an IP string is a valid IPv4 or IPv6 address
 */
const isValidIp = (ip) => {
    if (!ip || typeof ip !== "string")
        return false;
    const clean = (0, exports.normalizeIp)(ip);
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv4Regex.test(clean) || ipv6Regex.test(clean);
};
exports.isValidIp = isValidIp;
/**
 * Checks if an IP is loopback or localhost
 */
const isLoopbackIp = (ip) => {
    const clean = (0, exports.normalizeIp)(ip);
    return (clean === "127.0.0.1" ||
        clean === "::1" ||
        clean === "localhost" ||
        clean.startsWith("127."));
};
exports.isLoopbackIp = isLoopbackIp;
/**
 * Safely extracts and normalizes the client IP address from the request
 */
const getClientIp = (req) => {
    var _a;
    const cfConnectingIp = req.headers["cf-connecting-ip"];
    const xRealIp = req.headers["x-real-ip"];
    const forwarded = req.headers["x-forwarded-for"];
    let raw = "";
    if (cfConnectingIp) {
        raw = cfConnectingIp;
    }
    else if (xRealIp) {
        raw = xRealIp;
    }
    else if (typeof forwarded === "string") {
        raw = forwarded.split(",")[0];
    }
    else if (Array.isArray(forwarded) && forwarded.length > 0) {
        raw = forwarded[0];
    }
    else {
        raw = ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || req.ip || "127.0.0.1";
    }
    return (0, exports.normalizeIp)(raw);
};
exports.getClientIp = getClientIp;
const tenantBlockCache = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL
/**
 * Invalidates cached blocked IP records for a tenant (called upon block/unblock)
 */
const invalidateTenantIpCache = (tenantDbName) => {
    if (tenantDbName) {
        tenantBlockCache.delete(tenantDbName);
    }
    else {
        tenantBlockCache.clear();
    }
};
exports.invalidateTenantIpCache = invalidateTenantIpCache;
/**
 * Retrieves the blocked IP map for the current tenant from cache or MongoDB
 */
const getTenantBlockedRecords = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const dbKey = req.dbName || "SparkTek";
    const now = Date.now();
    const cached = tenantBlockCache.get(dbKey);
    if (cached && cached.expiresAt > now) {
        return cached.records;
    }
    const BlockedIpModel = (0, getTenantModel_1.getTenantModel)(req, "BlockedIp", blockedIp_model_1.blockedIpSchema);
    const records = yield BlockedIpModel.find({}).lean();
    const recordMap = new Map();
    for (const r of records) {
        recordMap.set((0, exports.normalizeIp)(r.ip), {
            reason: r.reason,
            scope: r.scope,
        });
    }
    tenantBlockCache.set(dbKey, {
        records: recordMap,
        expiresAt: now + CACHE_TTL_MS,
    });
    return recordMap;
});
exports.getTenantBlockedRecords = getTenantBlockedRecords;
/**
 * Checks whether an IP is blocked for checkout (scope "checkout" or "all")
 */
const getBlockedIpRecord = (req, clientIp) => __awaiter(void 0, void 0, void 0, function* () {
    const normalized = (0, exports.normalizeIp)(clientIp);
    const records = yield (0, exports.getTenantBlockedRecords)(req);
    return records.get(normalized) || null;
});
exports.getBlockedIpRecord = getBlockedIpRecord;
/**
 * Middleware: Blocks entire site access for IPs configured with scope "all".
 * Safe: Bypasses /api/v1/auth, blocked-ips routes, and active authenticated store admins
 * so administrators are never locked out of managing their store.
 */
const checkSiteIpBlock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientIp = (0, exports.getClientIp)(req);
        // Bypass check for static/root, auth endpoints, or blocked-ips routes
        const path = req.path;
        if (path === "/" ||
            path.startsWith("/auth") ||
            path.startsWith("/api/v1/auth") ||
            path.startsWith("/blocked-ips") ||
            path.startsWith("/api/v1/blocked-ips")) {
            return next();
        }
        // Always bypass if request has a valid Admin authorization token to prevent lockout
        const rawToken = req.headers.authorization;
        if (rawToken) {
            try {
                const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7).trim() : rawToken.trim();
                const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
                if (decoded && (decoded.role === "ADMIN" || decoded.role === "SUPER_ADMIN")) {
                    return next();
                }
            }
            catch (_a) {
                // Token invalid or expired, continue with IP check
            }
        }
        const blockedMap = yield (0, exports.getTenantBlockedRecords)(req);
        const blocked = blockedMap.get(clientIp);
        if (blocked && blocked.scope === "all") {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: "Access Denied: Your IP address has been restricted from accessing this website.",
                reason: blocked.reason || "Suspicious or abusive activity",
                blockedIp: clientIp,
            });
        }
        return next();
    }
    catch (error) {
        // Fail-open for safety to avoid taking down store if DB glitch occurs
        return next();
    }
});
exports.checkSiteIpBlock = checkSiteIpBlock;
