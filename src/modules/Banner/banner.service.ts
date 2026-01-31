import { Request } from "express";
import { bannerSchema } from "./banner.model";
import { IBanner } from "./banner.interface";
import { getTenantModel } from "../../app/utils/getTenantModel";

const createBanner = async (req: Request, payload: IBanner) => {
    const Banner = getTenantModel(req, 'Banner', bannerSchema);
    const result = await Banner.create(payload);
    return result;
}

const getAllBanners = async (req: Request) => {
    const Banner = getTenantModel(req, 'Banner', bannerSchema);
    const result = await Banner.find({ isActive: true });
    return result;
}

const updateBanner = async (req: Request, id: string, payload: Partial<IBanner>) => {
    const Banner = getTenantModel(req, 'Banner', bannerSchema);
    const result = await Banner.findByIdAndUpdate(id, payload, { new: true });
    return result;
}

const deleteBanner = async (req: Request, id: string) => {
    const Banner = getTenantModel(req, 'Banner', bannerSchema);
    const result = await Banner.findByIdAndDelete(id);
    return result;
}

export const bannerService = {
    createBanner,
    getAllBanners,
    updateBanner,
    deleteBanner
}

