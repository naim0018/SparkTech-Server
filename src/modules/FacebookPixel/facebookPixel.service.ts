import { Request } from "express";
import { facebookPixelSchema } from "./facebookPixel.model";
import { IFacebookPixel } from "./facebookPixel.interface";
import { getTenantModel } from "../../app/utils/getTenantModel";

const createFacebookPixel = async (req: Request, payload: Partial<IFacebookPixel>) => {
    const FacebookPixel = getTenantModel(req, 'FacebookPixel', facebookPixelSchema);
    const isExist = await FacebookPixel.findOne({});
    if (isExist) {
        throw new Error("Facebook Pixel config already exists. Use update instead.");
    }
    const result = await FacebookPixel.create(payload);
    return result;
}

const getFacebookPixel = async (req: Request) => {
    const FacebookPixel = getTenantModel(req, 'FacebookPixel', facebookPixelSchema);
    const result = await FacebookPixel.findOne({});
    return result;
}

const updateFacebookPixel = async (req: Request, payload: Partial<IFacebookPixel>) => {
    const FacebookPixel = getTenantModel(req, 'FacebookPixel', facebookPixelSchema);
    const result = await FacebookPixel.findOneAndUpdate({}, payload, { new: true });
    return result;
}

const deleteFacebookPixel = async (req: Request) => {
    const FacebookPixel = getTenantModel(req, 'FacebookPixel', facebookPixelSchema);
    const result = await FacebookPixel.findOneAndUpdate({}, { pixelId: "", accessToken: "" }, { new: true });
    return result;
}

export const facebookPixelService = {
    createFacebookPixel,
    getFacebookPixel,
    updateFacebookPixel,
    deleteFacebookPixel
}

