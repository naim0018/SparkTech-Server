import { FacebookPixel } from "./facebookPixel.model";
import { IFacebookPixel } from "./facebookPixel.interface";

const createFacebookPixel = async (payload: Partial<IFacebookPixel>) => {
    const isExist = await FacebookPixel.findOne({});
    if (isExist) {
        throw new Error("Facebook Pixel config already exists. Use update instead.");
    }
    const result = await FacebookPixel.create(payload);
    return result;
}

const getFacebookPixel = async () => {
    const result = await FacebookPixel.findOne({});
    return result;
}

const updateFacebookPixel = async (payload: Partial<IFacebookPixel>) => {
    const result = await FacebookPixel.findOneAndUpdate({}, payload, { new: true });
    return result;
}

const deleteFacebookPixel = async () => {
    const result = await FacebookPixel.findOneAndUpdate({}, { pixelId: "", accessToken: "" }, { new: true });
    return result;
}

export const facebookPixelService = {
    createFacebookPixel,
    getFacebookPixel,
    updateFacebookPixel,
    deleteFacebookPixel
}
