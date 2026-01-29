import { Request } from "express";
import { googleAnalyticsSchema } from "./googleAnalytics.model";
import { getTenantModel } from "../../app/utils/getTenantModel";

const createGoogleAnalytics = async (req: Request, id: string) => {
    const GoogleAnalytics = getTenantModel(req, 'GoogleAnalytics', googleAnalyticsSchema);
    const isExist = await GoogleAnalytics.findOne({});
    if (isExist) {
        throw new Error("Google Analytics config already exists. Use update instead.");
    }
    const result = await GoogleAnalytics.create({ googleAnalyticsId: id });
    return result;
}

const getGoogleAnalytics = async (req: Request) => {
    const GoogleAnalytics = getTenantModel(req, 'GoogleAnalytics', googleAnalyticsSchema);
    const result = await GoogleAnalytics.findOne({});
    return result;
}

const updateGoogleAnalytics = async (req: Request, id: string) => {
    const GoogleAnalytics = getTenantModel(req, 'GoogleAnalytics', googleAnalyticsSchema);
    const result = await GoogleAnalytics.findOneAndUpdate({}, { googleAnalyticsId: id }, { new: true });
    return result;
}

const deleteGoogleAnalytics = async (req: Request) => {
    const GoogleAnalytics = getTenantModel(req, 'GoogleAnalytics', googleAnalyticsSchema);
    const result = await GoogleAnalytics.findOneAndUpdate({}, { googleAnalyticsId: "" }, { new: true });
    return result;
}

export const googleAnalyticsService = {
    createGoogleAnalytics,
    getGoogleAnalytics,
    updateGoogleAnalytics,
    deleteGoogleAnalytics
}

