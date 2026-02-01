import { Document } from "mongoose";

export interface ITracking extends Document {
  googleAnalyticsId: string;
  facebookPixelId: string;
  facebookAccessToken: string;
  facebookPageId: string;
  whatsappNumber: string;
  tiktokPixelId: string;
  gtmId: string;
  clarityId: string;
  searchConsoleVerificationCode: string;
  lookerStudioEmbedUrl: string;
  steadfastApiKey: string;
  steadfastSecretKey: string;
  steadfastEnabled: boolean;
}
