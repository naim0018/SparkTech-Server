import { Document } from "mongoose";

export interface ITracking extends Document {
  googleAnalyticsId: string;
  facebookPixelId: string;
  facebookAccessToken: string;
  tiktokPixelId: string;
  gtmId: string;
  clarityId: string;
  searchConsoleVerificationCode: string;
  lookerStudioEmbedUrl: string;
}
