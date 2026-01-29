import { Schema, model } from "mongoose";
import { ITracking } from "./tracking.interface";

const trackingSchema = new Schema<ITracking>(
  {
    googleAnalyticsId: { type: String, default: "" },
    facebookPixelId: { type: String, default: "" },
    facebookAccessToken: { type: String, default: "" },
    tiktokPixelId: { type: String, default: "" },
    gtmId: { type: String, default: "" },
    clarityId: { type: String, default: "" },
    searchConsoleVerificationCode: { type: String, default: "" },
    lookerStudioEmbedUrl: { type: String, default: "" },
    steadfastApiKey: { type: String, default: "" },
    steadfastSecretKey: { type: String, default: "" },
    steadfastEnabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export { trackingSchema };
export const Tracking = model<ITracking>("Tracking", trackingSchema);
