import { Request, Response } from "express";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { getTenantModel } from "../../app/utils/getTenantModel";
import { trackingSchema } from "../TrackingIntegrations/tracking.model";

const getDashboardData = async (req: Request, res: Response) => {
  try {
    const TrackingModel = getTenantModel(req, "Tracking", trackingSchema);
    const tracking = await TrackingModel.findOne();

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
    } catch (e) {
      return res.status(200).json({
        success: false,
        message: "Invalid Service Account JSON. Please re-upload.",
        data: null
      });
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      }
    });

    const [response] = await analyticsDataClient.batchRunReports({
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
    const timelineReport = response.reports?.[0];
    const chartData = timelineReport?.rows?.map(row => {
      const dateStr = row.dimensionValues?.[0].value || "";
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
        activeUsers: parseInt(row.metricValues?.[0].value || "0", 10),
        pageViews: parseInt(row.metricValues?.[1].value || "0", 10),
        eventCount: parseInt(row.metricValues?.[2].value || "0", 10),
      };
    }) || [];

    chartData.sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    // Calculate totals
    const baseTotals = {
      activeUsers: chartData.reduce((sum, item) => sum + item.activeUsers, 0),
      pageViews: chartData.reduce((sum, item) => sum + item.pageViews, 0),
      eventCount: chartData.reduce((sum, item) => sum + item.eventCount, 0),
    };

    // Extra Totals
    const totalsReport = response.reports?.[1];
    const extraTotals = totalsReport?.rows?.[0]?.metricValues || [];
    const sessions = parseInt(extraTotals[0]?.value || "0", 10);
    const bounceRate = parseFloat(extraTotals[1]?.value || "0");
    const totalRevenue = parseFloat(extraTotals[2]?.value || "0");

    const totals = { ...baseTotals, sessions, bounceRate, totalRevenue };

    // Top Pages
    const pagesReport = response.reports?.[2];
    const topPages = pagesReport?.rows?.map(row => ({
      path: row.dimensionValues?.[0].value || "",
      title: row.dimensionValues?.[1].value || "",
      views: parseInt(row.metricValues?.[0].value || "0", 10)
    })) || [];

    // Devices
    const devicesReport = response.reports?.[3];
    const devices = devicesReport?.rows?.map(row => ({
      category: row.dimensionValues?.[0].value || "",
      users: parseInt(row.metricValues?.[0].value || "0", 10)
    })) || [];

    // Countries
    const countriesReport = response.reports?.[4];
    const countries = countriesReport?.rows?.map(row => ({
      country: row.dimensionValues?.[0].value || "",
      users: parseInt(row.metricValues?.[0].value || "0", 10)
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

  } catch (error: any) {
    console.error("GA API Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Google Analytics data",
      data: null
    });
  }
};

const getClientIp = (req: Request): string => {
  const cfConnectingIp = req.headers["cf-connecting-ip"] as string;
  const xRealIp = req.headers["x-real-ip"] as string;
  const forwarded = req.headers["x-forwarded-for"];
  if (cfConnectingIp) return cfConnectingIp.trim();
  if (xRealIp) return xRealIp.trim();
  if (forwarded) {
    const ips = typeof forwarded === "string" ? forwarded.split(",") : forwarded;
    return ips[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
};

// 1. Log an interaction event (Public endpoint, saved per tenant database)
const logEvent = async (req: Request, res: Response) => {
  try {
    const { event, path, device, payload, user, referrer } = req.body;
    if (!event) {
      return res.status(400).json({ success: false, message: "Event name is required" });
    }

    const { websiteEventSchema } = await import("./websiteEvent.model");
    const WebsiteEventModel = getTenantModel(req, "WebsiteEvent", websiteEventSchema);
    const ip = getClientIp(req);

    const savedEvent = await WebsiteEventModel.create({
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
  } catch (error: any) {
    console.error("Log event error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to log event"
    });
  }
};

// 2. Get paginated interaction events (Admin endpoint, reads from tenant database)
const getEvents = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;
    const search = (req.query.search as string || "").trim();
    const category = (req.query.category as string || "all").trim();

    const { websiteEventSchema } = await import("./websiteEvent.model");
    const WebsiteEventModel = getTenantModel(req, "WebsiteEvent", websiteEventSchema);

    const filter: Record<string, any> = {};

    if (category && category !== "all") {
      if (category === "Purchases") filter.event = "purchase";
      else if (category === "Cart") filter.event = { $in: ["add_to_cart", "remove_from_cart", "view_cart"] };
      else if (category === "Search") filter.event = "search";
      else if (category === "Auth") filter.event = { $in: ["login", "sign_up"] };
      else filter.event = category;
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

    const [events, total] = await Promise.all([
      WebsiteEventModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      WebsiteEventModel.countDocuments(filter)
    ]);

    // Aggregate key metrics across all events in this tenant's collection
    const [totalPurchases, totalRevenueAgg, totalCarts, totalSearches] = await Promise.all([
      WebsiteEventModel.countDocuments({ event: "purchase" }),
      WebsiteEventModel.aggregate([
        { $match: { event: "purchase" } },
        { $group: { _id: null, total: { $sum: "$payload.ecommerce.value" } } }
      ]),
      WebsiteEventModel.countDocuments({ event: "add_to_cart" }),
      WebsiteEventModel.countDocuments({ event: "search" })
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

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
          totalEvents: await WebsiteEventModel.countDocuments(),
          totalPurchases,
          totalRevenue,
          totalCarts,
          totalSearches
        }
      }
    });
  } catch (error: any) {
    console.error("Get events error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch interaction events"
    });
  }
};

// 3. Clear interaction events for this tenant
const clearEvents = async (req: Request, res: Response) => {
  try {
    const { websiteEventSchema } = await import("./websiteEvent.model");
    const WebsiteEventModel = getTenantModel(req, "WebsiteEvent", websiteEventSchema);
    await WebsiteEventModel.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "Interaction logs cleared successfully"
    });
  } catch (error: any) {
    console.error("Clear events error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear logs"
    });
  }
};

export const AnalyticsDashboardController = {
  getDashboardData,
  logEvent,
  getEvents,
  clearEvents
};
