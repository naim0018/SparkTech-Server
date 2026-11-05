import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { getTenantModel } from "../utils/getTenantModel";
import { blockedIpSchema } from "../../modules/BlockedIp/blockedIp.model";

/**
 * Normalizes an IP address:
 * - Strips IPv4-mapped IPv6 prefix (::ffff:192.168.1.1 -> 192.168.1.1)
 * - Trims whitespace
 * - Strips any attached port number (e.g. 192.168.1.1:8080)
 */
export const normalizeIp = (rawIp: string): string => {
  if (!rawIp || typeof rawIp !== "string") return "127.0.0.1";
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

/**
 * Helper to check whether an IP string is a valid IPv4 or IPv6 address
 */
export const isValidIp = (ip: string): boolean => {
  if (!ip || typeof ip !== "string") return false;
  const clean = normalizeIp(ip);
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv4Regex.test(clean) || ipv6Regex.test(clean);
};

/**
 * Checks if an IP is loopback or localhost
 */
export const isLoopbackIp = (ip: string): boolean => {
  const clean = normalizeIp(ip);
  return (
    clean === "127.0.0.1" ||
    clean === "::1" ||
    clean === "localhost" ||
    clean.startsWith("127.")
  );
};

/**
 * Safely extracts and normalizes the client IP address from the request
 */
export const getClientIp = (req: Request): string => {
  const cfConnectingIp = req.headers["cf-connecting-ip"] as string;
  const xRealIp = req.headers["x-real-ip"] as string;
  const forwarded = req.headers["x-forwarded-for"];

  let raw = "";
  if (cfConnectingIp) {
    raw = cfConnectingIp;
  } else if (xRealIp) {
    raw = xRealIp;
  } else if (typeof forwarded === "string") {
    raw = forwarded.split(",")[0];
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    raw = forwarded[0];
  } else {
    raw = req.socket?.remoteAddress || req.ip || "127.0.0.1";
  }

  return normalizeIp(raw);
};

// -----------------------------------------------------------------------------
// In-Memory Fast Cache for Blocked IPs (Prevents constant MongoDB round-trips)
// -----------------------------------------------------------------------------
interface TenantBlockCache {
  records: Map<string, { reason?: string; scope: "all" | "checkout" }>;
  expiresAt: number;
}

const tenantBlockCache = new Map<string, TenantBlockCache>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL

/**
 * Invalidates cached blocked IP records for a tenant (called upon block/unblock)
 */
export const invalidateTenantIpCache = (tenantDbName?: string): void => {
  if (tenantDbName) {
    tenantBlockCache.delete(tenantDbName);
  } else {
    tenantBlockCache.clear();
  }
};

/**
 * Retrieves the blocked IP map for the current tenant from cache or MongoDB
 */
export const getTenantBlockedRecords = async (
  req: Request
): Promise<Map<string, { reason?: string; scope: "all" | "checkout" }>> => {
  const dbKey = req.dbName || "SparkTek";
  const now = Date.now();
  const cached = tenantBlockCache.get(dbKey);

  if (cached && cached.expiresAt > now) {
    return cached.records;
  }

  const BlockedIpModel = getTenantModel(req, "BlockedIp", blockedIpSchema);
  const records = await BlockedIpModel.find({}).lean();

  const recordMap = new Map<string, { reason?: string; scope: "all" | "checkout" }>();
  for (const r of records) {
    recordMap.set(normalizeIp(r.ip), {
      reason: r.reason,
      scope: r.scope as "all" | "checkout",
    });
  }

  tenantBlockCache.set(dbKey, {
    records: recordMap,
    expiresAt: now + CACHE_TTL_MS,
  });

  return recordMap;
};

/**
 * Checks whether an IP is blocked for checkout (scope "checkout" or "all")
 */
export const getBlockedIpRecord = async (
  req: Request,
  clientIp: string
): Promise<{ reason?: string; scope: "all" | "checkout" } | null> => {
  const normalized = normalizeIp(clientIp);
  const records = await getTenantBlockedRecords(req);
  return records.get(normalized) || null;
};

/**
 * Middleware: Blocks entire site access for IPs configured with scope "all".
 * Safe: Bypasses /api/v1/auth, blocked-ips routes, and active authenticated store admins
 * so administrators are never locked out of managing their store.
 */
export const checkSiteIpBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIp = getClientIp(req);

    // Bypass check for static/root, auth endpoints, or blocked-ips routes
    const path = req.path;
    if (
      path === "/" ||
      path.startsWith("/auth") ||
      path.startsWith("/api/v1/auth") ||
      path.startsWith("/blocked-ips") ||
      path.startsWith("/api/v1/blocked-ips")
    ) {
      return next();
    }

    // Always bypass if request has a valid Admin authorization token to prevent lockout
    const rawToken = req.headers.authorization;
    if (rawToken) {
      try {
        const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7).trim() : rawToken.trim();
        const decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
        if (decoded && (decoded.role === "ADMIN" || decoded.role === "SUPER_ADMIN")) {
          return next();
        }
      } catch {
        // Token invalid or expired, continue with IP check
      }
    }

    const blockedMap = await getTenantBlockedRecords(req);
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
  } catch (error) {
    // Fail-open for safety to avoid taking down store if DB glitch occurs
    return next();
  }
};
