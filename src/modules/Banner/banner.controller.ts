import { Request, Response } from "express";
import { bannerService } from "./banner.service";

const createBanner = async (req: Request, res: Response) => {
    try {
        const result = await bannerService.createBanner(req, req.body);
        res.status(200).json({
            success: true,
            message: 'Banner created successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create banner',
            error: error
        });
    }
}

const getAllBanners = async (req: Request, res: Response) => {
    try {
        const result = await bannerService.getAllBanners(req);
        res.status(200).json({
            success: true,
            message: 'Banners fetched successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banners',
            error: error
        });
    }
}

const updateBanner = async (req: Request, res: Response) => {
    try {
        const result = await bannerService.updateBanner(req, req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Banner updated successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update banner',
            error: error
        });
    }
}

const deleteBanner = async (req: Request, res: Response) => {
    try {
        const result = await bannerService.deleteBanner(req, req.params.id);
        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete banner',
            error: error
        });
    }
}

export const bannerController = {
    createBanner,
    getAllBanners,
    updateBanner,
    deleteBanner
}
