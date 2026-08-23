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

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${tracking.googleAnalyticsPropertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'date' },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'eventCount' }
      ],
    });

    // Format data for Recharts
    const chartData = response.rows?.map(row => {
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
    const totals = {
      activeUsers: chartData.reduce((sum, item) => sum + item.activeUsers, 0),
      pageViews: chartData.reduce((sum, item) => sum + item.pageViews, 0),
      eventCount: chartData.reduce((sum, item) => sum + item.eventCount, 0),
    };

    return res.status(200).json({
      success: true,
      message: "Analytics data fetched successfully",
      data: {
        chartData,
        totals
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
