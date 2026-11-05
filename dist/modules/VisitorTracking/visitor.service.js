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
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitorService = void 0;
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const visitor_model_1 = require("./visitor.model");
// Simple coordinates mapping for popular test countries
const MOCK_LOCATIONS = [
    { country: "Bangladesh", code: "BD", city: "Dhaka", lat: 23.8103, lon: 90.4125 },
    { country: "United States", code: "US", city: "New York", lat: 40.7128, lon: -74.006 },
    { country: "United Kingdom", code: "GB", city: "London", lat: 51.5074, lon: -0.1278 },
    { country: "India", code: "IN", city: "Mumbai", lat: 19.076, lon: 72.8777 },
    { country: "Singapore", code: "SG", city: "Singapore", lat: 1.3521, lon: 103.8198 },
    { country: "China", code: "CN", city: "Beijing", lat: 39.9042, lon: 116.4074 }
];
const ipBlocker_1 = require("../../app/middleware/ipBlocker");
// Helper to check if IP is private/local
const isLocalIp = (ip) => {
    return (ip === "127.0.0.1" ||
        ip === "::1" ||
        ip.startsWith("192.168.") ||
        ip.startsWith("10.") ||
        ip.startsWith("172.16."));
};
// Geolocate IP (with fast fallbacks)
const geolocate = (req, ip) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Try to read hosting provider headers first (Cloudflare, Vercel etc)
    const cfCountry = req.headers["cf-ipcountry"];
    const vercelCountry = req.headers["x-vercel-ip-country"];
    const headerCountryCode = cfCountry || vercelCountry;
    if (headerCountryCode) {
        const code = headerCountryCode.toUpperCase();
        const matched = MOCK_LOCATIONS.find((loc) => loc.code === code);
        if (matched) {
            return {
                country: matched.country,
                countryCode: matched.code,
                city: matched.city,
                latitude: matched.lat,
                longitude: matched.lon
            };
        }
    }
    // 2. Fallback if local/private IP - return a realistic mock location to populate the map during testing
    if (isLocalIp(ip)) {
        // Pick a random mock location to make the map alive
        const idx = Math.floor(Math.random() * MOCK_LOCATIONS.length);
        return {
            country: MOCK_LOCATIONS[idx].country,
            countryCode: MOCK_LOCATIONS[idx].code,
            city: MOCK_LOCATIONS[idx].city,
            latitude: MOCK_LOCATIONS[idx].lat,
            longitude: MOCK_LOCATIONS[idx].lon
        };
    }
    // 3. Resolve using a free API (ip-api.com) with timeout & try-catch
    try {
        const res = yield fetch(`http://ip-api.com/json/${ip}`);
        if (res.ok) {
            const data = yield res.json();
            if (data && data.status === "success") {
                return {
                    country: data.country || "Unknown",
                    countryCode: data.countryCode || "UN",
                    city: data.city || "",
                    latitude: data.lat || 0,
                    longitude: data.lon || 0
                };
            }
        }
    }
    catch (error) {
        console.error("GeoIP lookup failed:", error);
    }
    // Final fallback
    return {
        country: "Bangladesh",
        countryCode: "BD",
        city: "Dhaka",
        latitude: 23.8103,
        longitude: 90.4125
    };
});
const saveHeartbeat = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const VisitorSession = (0, getTenantModel_1.getTenantModel)(req, "VisitorSession", visitor_model_1.visitorSessionSchema);
    const now = new Date();
    // Find existing session
    let session = yield VisitorSession.findOne({ sessionToken: payload.sessionToken });
    if (session) {
        // Calculate elapsed time (heartbeat interval is normally 10-15s)
        const elapsedSeconds = Math.round((now.getTime() - session.lastActive.getTime()) / 1000);
        // Only accumulate duration if the tab wasn't idling/inactive for too long (max 1 minute gap)
        const durationIncrement = elapsedSeconds > 0 && elapsedSeconds < 60 ? elapsedSeconds : 0;
        session.lastActive = now;
        session.duration = (session.duration || 0) + durationIncrement;
        session.activePage = payload.page;
        session.activePageTitle = payload.pageTitle;
        // Add page visit history if user switched page path
        const alreadyVisited = session.pagesVisited.some((p) => p.page === payload.page);
        if (!alreadyVisited) {
            session.pagesVisited.push({
                page: payload.page,
                title: payload.pageTitle,
                timestamp: now
            });
        }
        yield session.save();
    }
    else {
        // Resolve location info
        const ip = (0, ipBlocker_1.getClientIp)(req);
        const geo = yield geolocate(req, ip);
        session = yield VisitorSession.create(Object.assign({ sessionToken: payload.sessionToken, ip, userAgent: req.headers["user-agent"] || "", referrer: payload.referrer || "", isReturning: !!payload.isReturning, activePage: payload.page, activePageTitle: payload.pageTitle, pagesVisited: [
                {
                    page: payload.page,
                    title: payload.pageTitle,
                    timestamp: now
                }
            ], duration: 0, lastActive: now }, geo));
    }
    return session;
});
const getVisitorStats = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const VisitorSession = (0, getTenantModel_1.getTenantModel)(req, "VisitorSession", visitor_model_1.visitorSessionSchema);
    const now = new Date();
    // 1. Online Now criteria (active within last 2 minutes)
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const onlineSessions = yield VisitorSession.find({
        lastActive: { $gte: twoMinutesAgo }
    });
    // Calculate active (active within 20s) vs idle (between 20s and 2 minutes)
    const twentySecondsAgo = new Date(now.getTime() - 20 * 1000);
    const activeCount = onlineSessions.filter((s) => s.lastActive >= twentySecondsAgo).length;
    const idleCount = onlineSessions.length - activeCount;
    // 2. Seen 24h (sessions active/updated in last 24h)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const total24hSessions = yield VisitorSession.find({
        updatedAt: { $gte: twentyFourHoursAgo }
    });
    // Calculate returning rate
    const returningCount = total24hSessions.filter((s) => s.isReturning).length;
    const returningPercentage = total24hSessions.length > 0
        ? Math.round((returningCount / total24hSessions.length) * 100)
        : 0;
    // Calculate average session duration (in minutes) for sessions with some activity
    const activeSessions24h = total24hSessions.filter((s) => s.duration > 0);
    const totalDuration = activeSessions24h.reduce((acc, s) => acc + s.duration, 0);
    const avgSessionMin = activeSessions24h.length > 0
        ? Number((totalDuration / activeSessions24h.length / 60).toFixed(1))
        : 0;
    // 3. Top countries today
    const countryAggregation = yield VisitorSession.aggregate([
        { $match: { updatedAt: { $gte: twentyFourHoursAgo } } },
        { $group: { _id: { country: "$country", code: "$countryCode" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    const topCountries = countryAggregation.map((item) => ({
        name: item._id.country || "Unknown",
        code: item._id.code || "UN",
        count: item.count
    }));
    // 4. Top pages today (aggregate active page visits across all session histories)
    const pageAggregation = yield VisitorSession.aggregate([
        { $match: { updatedAt: { $gte: twentyFourHoursAgo } } },
        { $unwind: "$pagesVisited" },
        { $group: { _id: { page: "$pagesVisited.page", title: "$pagesVisited.title" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    const topPages = pageAggregation.map((item) => ({
        page: item._id.page || "/",
        title: item._id.title || "Untitled Page",
        count: item.count
    }));
    return {
        onlineCount: onlineSessions.length,
        activeCount,
        idleCount,
        seen24h: total24hSessions.length,
        returningPercentage,
        avgSessionMin,
        topCountries,
        topPages,
        // Return detailed list of active visitors for mapping and list view
        visitors: onlineSessions.map((s) => ({
            id: s.sessionToken,
            country: s.country,
            countryCode: s.countryCode,
            city: s.city,
            latitude: s.latitude,
            longitude: s.longitude,
            activePage: s.activePage,
            activePageTitle: s.activePageTitle,
            lastActive: s.lastActive,
            duration: s.duration,
            referrer: s.referrer,
            ip: s.ip
        }))
    };
});
exports.visitorService = {
    saveHeartbeat,
    getVisitorStats
};
