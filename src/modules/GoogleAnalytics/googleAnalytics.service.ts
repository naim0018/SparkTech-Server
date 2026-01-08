import { GoogleAnalytics } from "./googleAnalytics.model";

const createGoogleAnalytics = async (id: string) => {
    const isExist = await GoogleAnalytics.findOne({});
    if (isExist) {
        throw new Error("Google Analytics config already exists. Use update instead.");
    }
    const result = await GoogleAnalytics.create({ googleAnalyticsId: id });
    return result;
}

const getGoogleAnalytics = async () => {
    const result = await GoogleAnalytics.findOne({});
    return result;
}

const updateGoogleAnalytics = async (id: string) => {
    const result = await GoogleAnalytics.findOneAndUpdate({}, { googleAnalyticsId: id }, { new: true });
    return result;
}

const deleteGoogleAnalytics = async () => {
    const result = await GoogleAnalytics.findOneAndUpdate({}, { googleAnalyticsId: "" }, { new: true });
    return result;
}

export const googleAnalyticsService = {
    createGoogleAnalytics,
    getGoogleAnalytics,
    updateGoogleAnalytics,
    deleteGoogleAnalytics
}
