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

export const AnalyticsDashboardController = {
  getDashboardData
};
