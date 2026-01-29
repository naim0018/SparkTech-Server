import { Schema, model } from "mongoose";
import { IGoogleAnalytics } from "./googleAnalytics.interface";

const googleAnalyticsSchema = new Schema<IGoogleAnalytics>({
    googleAnalyticsId: { type: String, default: "" },
}, {
    timestamps: true
});

export { googleAnalyticsSchema };
export const GoogleAnalytics = model<IGoogleAnalytics>('GoogleAnalytics', googleAnalyticsSchema);
