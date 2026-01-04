import { Banner } from "./banner.model";
import { IBanner } from "./banner.interface";

const createBanner = async (payload: IBanner) => {
    const result = await Banner.create(payload);
    return result;
}

const getAllBanners = async () => {
    const result = await Banner.find({ isActive: true });
    return result;
}

const updateBanner = async (id: string, payload: Partial<IBanner>) => {
    const result = await Banner.findByIdAndUpdate(id, payload, { new: true });
    return result;
}

const deleteBanner = async (id: string) => {
    const result = await Banner.findByIdAndDelete(id);
    return result;
}

export const bannerService = {
    createBanner,
    getAllBanners,
    updateBanner,
    deleteBanner
}
