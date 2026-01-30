"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerController = void 0;
const banner_service_1 = require("./banner.service");
const createBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield banner_service_1.bannerService.createBanner(req, req.body);
        res.status(200).json({
            success: true,
            message: 'Banner created successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create banner',
            error: error
        });
    }
});
const getAllBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield banner_service_1.bannerService.getAllBanners(req);
        res.status(200).json({
            success: true,
            message: 'Banners fetched successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banners',
            error: error
        });
    }
});
const updateBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield banner_service_1.bannerService.updateBanner(req, req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Banner updated successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update banner',
            error: error
        });
    }
});
const deleteBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield banner_service_1.bannerService.deleteBanner(req, req.params.id);
        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete banner',
            error: error
        });
    }
});
exports.bannerController = {
    createBanner,
    getAllBanners,
    updateBanner,
    deleteBanner
};
