"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AnalyticsDashboardController = void 0;
const data_1 = require("@google-analytics/data");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const tracking_model_1 = require("../TrackingIntegrations/tracking.model");
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    try {
        const TrackingModel = (0, getTenantModel_1.getTenantModel)(req, "Tracking", tracking_model_1.trackingSchema);
        const tracking = yield TrackingModel.findOne();
        if (!tracking || !tracking.googleAnalyticsPropertyId || !tracking.googleAnalyticsServiceAccountJson) {
            return res.status(200).json({
                success: false,
                message: "Google Analytics is not configured. Please upload credentials in Settings.",
                data: null
            });
        }
        let credentials;
        try {
            credentials = JSON.parse(tracking.googleAnalyticsServiceAccountJson);
        }
        catch (e) {
            return res.status(200).json({
                success: false,
                message: "Invalid Service Account JSON. Please re-upload.",
                data: null
            });
        }
        const analyticsDataClient = new data_1.BetaAnalyticsDataClient({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key,
            }
        });
        const [response] = yield analyticsDataClient.batchRunReports({
            property: `properties/${tracking.googleAnalyticsPropertyId}`,
            requests: [
                // 0: Timeline
                {
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    dimensions: [{ name: 'date' }],
                    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'eventCount' }],
                },
                // 1: Totals
                {
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    metrics: [{ name: 'sessions' }, { name: 'bounceRate' }, { name: 'totalRevenue' }],
                },
                // 2: Top Pages
                {
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
                    metrics: [{ name: 'screenPageViews' }],
                    limit: 10,
                    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
                },
                // 3: Devices
                {
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    dimensions: [{ name: 'deviceCategory' }],
                    metrics: [{ name: 'activeUsers' }],
                    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
                },
                // 4: Countries
                {
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    dimensions: [{ name: 'country' }],
                    metrics: [{ name: 'activeUsers' }],
                    limit: 10,
                    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
                }
            ]
        });
        // Format data for Recharts
        const timelineReport = (_a = response.reports) === null || _a === void 0 ? void 0 : _a[0];
        const chartData = ((_b = timelineReport === null || timelineReport === void 0 ? void 0 : timelineReport.rows) === null || _b === void 0 ? void 0 : _b.map(row => {
            var _a, _b, _c, _d;
            const dateStr = ((_a = row.dimensionValues) === null || _a === void 0 ? void 0 : _a[0].value) || "";
            // Format YYYYMMDD to DD MMM
            let formattedDate = dateStr;
            if (dateStr.length === 8) {
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);
                const d = new Date(`${year}-${month}-${day}`);
                formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return {
                date: formattedDate,
                rawDate: dateStr,
                activeUsers: parseInt(((_b = row.metricValues) === null || _b === void 0 ? void 0 : _b[0].value) || "0", 10),
                pageViews: parseInt(((_c = row.metricValues) === null || _c === void 0 ? void 0 : _c[1].value) || "0", 10),
                eventCount: parseInt(((_d = row.metricValues) === null || _d === void 0 ? void 0 : _d[2].value) || "0", 10),
            };
        })) || [];
        chartData.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
        // Calculate totals
        const baseTotals = {
            activeUsers: chartData.reduce((sum, item) => sum + item.activeUsers, 0),
            pageViews: chartData.reduce((sum, item) => sum + item.pageViews, 0),
            eventCount: chartData.reduce((sum, item) => sum + item.eventCount, 0),
        };
        // Extra Totals
        const totalsReport = (_c = response.reports) === null || _c === void 0 ? void 0 : _c[1];
        const extraTotals = ((_e = (_d = totalsReport === null || totalsReport === void 0 ? void 0 : totalsReport.rows) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.metricValues) || [];
        const sessions = parseInt(((_f = extraTotals[0]) === null || _f === void 0 ? void 0 : _f.value) || "0", 10);
        const bounceRate = parseFloat(((_g = extraTotals[1]) === null || _g === void 0 ? void 0 : _g.value) || "0");
        const totalRevenue = parseFloat(((_h = extraTotals[2]) === null || _h === void 0 ? void 0 : _h.value) || "0");
        const totals = Object.assign(Object.assign({}, baseTotals), { sessions, bounceRate, totalRevenue });
        // Top Pages
        const pagesReport = (_j = response.reports) === null || _j === void 0 ? void 0 : _j[2];
        const topPages = ((_k = pagesReport === null || pagesReport === void 0 ? void 0 : pagesReport.rows) === null || _k === void 0 ? void 0 : _k.map(row => {
            var _a, _b, _c;
            return ({
                path: ((_a = row.dimensionValues) === null || _a === void 0 ? void 0 : _a[0].value) || "",
                title: ((_b = row.dimensionValues) === null || _b === void 0 ? void 0 : _b[1].value) || "",
                views: parseInt(((_c = row.metricValues) === null || _c === void 0 ? void 0 : _c[0].value) || "0", 10)
            });
        })) || [];
        // Devices
        const devicesReport = (_l = response.reports) === null || _l === void 0 ? void 0 : _l[3];
        const devices = ((_m = devicesReport === null || devicesReport === void 0 ? void 0 : devicesReport.rows) === null || _m === void 0 ? void 0 : _m.map(row => {
            var _a, _b;
            return ({
                category: ((_a = row.dimensionValues) === null || _a === void 0 ? void 0 : _a[0].value) || "",
                users: parseInt(((_b = row.metricValues) === null || _b === void 0 ? void 0 : _b[0].value) || "0", 10)
            });
        })) || [];
        // Countries
        const countriesReport = (_o = response.reports) === null || _o === void 0 ? void 0 : _o[4];
        const countries = ((_p = countriesReport === null || countriesReport === void 0 ? void 0 : countriesReport.rows) === null || _p === void 0 ? void 0 : _p.map(row => {
            var _a, _b;
            return ({
                country: ((_a = row.dimensionValues) === null || _a === void 0 ? void 0 : _a[0].value) || "",
                users: parseInt(((_b = row.metricValues) === null || _b === void 0 ? void 0 : _b[0].value) || "0", 10)
            });
        })) || [];
        return res.status(200).json({
            success: true,
            message: "Analytics data fetched successfully",
            data: {
                chartData,
                totals,
                topPages,
                devices,
                countries
            }
        });
    }
    catch (error) {
        console.error("GA API Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch Google Analytics data",
            data: null
        });
    }
});
const getClientIp = (req) => {
    const cfConnectingIp = req.headers["cf-connecting-ip"];
    const xRealIp = req.headers["x-real-ip"];
    const forwarded = req.headers["x-forwarded-for"];
    if (cfConnectingIp)
        return cfConnectingIp.trim();
    if (xRealIp)
        return xRealIp.trim();
    if (forwarded) {
        const ips = typeof forwarded === "string" ? forwarded.split(",") : forwarded;
        return ips[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "127.0.0.1";
};
// 1. Log an interaction event (Public endpoint, saved per tenant database)
const logEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event, path, device, payload, user, referrer } = req.body;
        if (!event) {
            return res.status(400).json({ success: false, message: "Event name is required" });
        }
        const { websiteEventSchema } = yield Promise.resolve().then(() => __importStar(require("./websiteEvent.model")));
        const WebsiteEventModel = (0, getTenantModel_1.getTenantModel)(req, "WebsiteEvent", websiteEventSchema);
        const ip = getClientIp(req);
        const savedEvent = yield WebsiteEventModel.create({
            event,
            path: path || "/",
            ip,
            device: device || "Desktop",
            payload: payload || {},
            user,
            referrer: referrer || req.headers.referer || "",
            userAgent: req.headers["user-agent"] || "",
            timestamp: new Date()
        });
        return res.status(201).json({
            success: true,
            data: savedEvent
        });
    }
    catch (error) {
        console.error("Log event error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to log event"
        });
    }
});
// 2. Get paginated interaction events (Admin endpoint, reads from tenant database)
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;
        const search = (req.query.search || "").trim();
        const category = (req.query.category || "all").trim();
        const { websiteEventSchema } = yield Promise.resolve().then(() => __importStar(require("./websiteEvent.model")));
        const WebsiteEventModel = (0, getTenantModel_1.getTenantModel)(req, "WebsiteEvent", websiteEventSchema);
        const filter = {};
        if (category && category !== "all") {
            if (category === "Purchases")
                filter.event = "purchase";
            else if (category === "Cart")
                filter.event = { $in: ["add_to_cart", "remove_from_cart", "view_cart"] };
            else if (category === "Search")
                filter.event = "search";
            else if (category === "Auth")
                filter.event = { $in: ["login", "sign_up"] };
            else
                filter.event = category;
        }
        if (search) {
            filter.$or = [
                { event: { $regex: search, $options: "i" } },
                { path: { $regex: search, $options: "i" } },
                { ip: { $regex: search, $options: "i" } },
                { "user.name": { $regex: search, $options: "i" } },
                { "user.email": { $regex: search, $options: "i" } }
            ];
        }
        const [events, total] = yield Promise.all([
            WebsiteEventModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            WebsiteEventModel.countDocuments(filter)
        ]);
        // Aggregate key metrics across all events in this tenant's collection
        const [totalPurchases, totalRevenueAgg, totalCarts, totalSearches] = yield Promise.all([
            WebsiteEventModel.countDocuments({ event: "purchase" }),
            WebsiteEventModel.aggregate([
                { $match: { event: "purchase" } },
                { $group: { _id: null, total: { $sum: "$payload.ecommerce.value" } } }
            ]),
            WebsiteEventModel.countDocuments({ event: "add_to_cart" }),
            WebsiteEventModel.countDocuments({ event: "search" })
        ]);
        const totalRevenue = ((_a = totalRevenueAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        return res.status(200).json({
            success: true,
            data: {
                events,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                metrics: {
                    totalEvents: yield WebsiteEventModel.countDocuments(),
                    totalPurchases,
                    totalRevenue,
                    totalCarts,
                    totalSearches
                }
            }
        });
    }
    catch (error) {
        console.error("Get events error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch interaction events"
        });
    }
});
// 3. Clear interaction events for this tenant
const clearEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { websiteEventSchema } = yield Promise.resolve().then(() => __importStar(require("./websiteEvent.model")));
        const WebsiteEventModel = (0, getTenantModel_1.getTenantModel)(req, "WebsiteEvent", websiteEventSchema);
        yield WebsiteEventModel.deleteMany({});
        return res.status(200).json({
            success: true,
            message: "Interaction logs cleared successfully"
        });
    }
    catch (error) {
        console.error("Clear events error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to clear logs"
        });
    }
});
exports.AnalyticsDashboardController = {
    getDashboardData,
    logEvent,
    getEvents,
    clearEvents
};
