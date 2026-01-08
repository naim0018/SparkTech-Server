import { Document } from "mongoose";

export interface IGoogleAnalytics extends Document {
    googleAnalyticsId: string;
}
