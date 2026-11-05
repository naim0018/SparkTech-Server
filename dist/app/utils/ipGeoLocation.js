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
exports.getIpGeoLocation = void 0;
const axios_1 = __importDefault(require("axios"));
const ipBlocker_1 = require("../middleware/ipBlocker");
// In-memory cache to prevent redundant API calls for recurring IPs (TTL: 24 hours)
const geoCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const getIpGeoLocation = (ip) => __awaiter(void 0, void 0, void 0, function* () {
    const cleanIp = (0, ipBlocker_1.normalizeIp)(ip);
    // Check local loopback / private IP ranges
    if ((0, ipBlocker_1.isLoopbackIp)(cleanIp) ||
        cleanIp.startsWith("192.168.") ||
        cleanIp.startsWith("10.") ||
        cleanIp.startsWith("172.16.")) {
        return {
            ip: cleanIp,
            country: "Local / Development",
            countryCode: "LOC",
            city: "Localhost",
            region: "Dev Environment",
            isp: "Internal Network",
        };
    }
    // Validate that IP address is structurally valid before dispatching external HTTP request
    if (!(0, ipBlocker_1.isValidIp)(cleanIp)) {
        return {
            ip: cleanIp,
            country: "Unknown",
            city: "Unknown",
        };
    }
    // Check in-memory cache
    const cached = geoCache.get(cleanIp);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }
    try {
        // ip-api.com free tier (45 req/min, no API key required)
        const encodedIp = encodeURIComponent(cleanIp);
        const response = yield axios_1.default.get(`http://ip-api.com/json/${encodedIp}?fields=status,message,country,countryCode,regionName,city,isp,query`, { timeout: 2500 });
        if (response.data && response.data.status === "success") {
            const geoInfo = {
                ip: cleanIp,
                country: response.data.country,
                countryCode: response.data.countryCode,
                region: response.data.regionName,
                city: response.data.city,
                isp: response.data.isp,
            };
            geoCache.set(cleanIp, {
                data: geoInfo,
                expiresAt: Date.now() + CACHE_TTL_MS,
            });
            return geoInfo;
        }
    }
    catch (error) {
        // Fail silently and return fallback if external provider is offline or rate-limited
    }
    return {
        ip: cleanIp,
        country: "Unknown",
        city: "Unknown",
    };
});
exports.getIpGeoLocation = getIpGeoLocation;
