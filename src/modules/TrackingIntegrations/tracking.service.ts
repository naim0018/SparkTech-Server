import { Request } from "express";
import { trackingSchema } from "./tracking.model";
import { ITracking } from "./tracking.interface";
import { getTenantModel } from "../../app/utils/getTenantModel";

// Get the single tracking document, or create it if not exists
const getTrackingSettings = async (req: Request) => {
  const Tracking = getTenantModel(req, 'Tracking', trackingSchema);
  let settings = await Tracking.findOne();
  if (!settings) {
    settings = await Tracking.create({});
  }
  return settings;
};

const updateTrackingSettings = async (req: Request, payload: Partial<ITracking>) => {
  const Tracking = getTenantModel(req, 'Tracking', trackingSchema);
  let settings = await Tracking.findOne();

  // Prevent masked values from overwriting the real keys
  if (payload.facebookAccessToken === "**********") delete payload.facebookAccessToken;
  if (payload.steadfastApiKey === "**********") delete payload.steadfastApiKey;
  if (payload.steadfastSecretKey === "**********") delete payload.steadfastSecretKey;
  if (payload.googleAnalyticsServiceAccountJson === "**********") delete payload.googleAnalyticsServiceAccountJson;

  // Trim string values to eliminate accidental trailing/leading whitespace (e.g., "GTM-XXXX ")
  for (const key of Object.keys(payload) as Array<keyof ITracking>) {
    if (typeof payload[key] === "string") {
      (payload as any)[key] = (payload[key] as string).trim();
    }
  }

  if (!settings) {
    settings = await Tracking.create(payload);
  } else {
    settings = await Tracking.findByIdAndUpdate(settings._id, payload, {
      new: true,
      runValidators: true,
    });
  }
  return settings;
};

export const TrackingServices = {
  getTrackingSettings,
  updateTrackingSettings,
};
