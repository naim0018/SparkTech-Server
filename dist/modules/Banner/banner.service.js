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
exports.bannerService = void 0;
const banner_model_1 = require("./banner.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const createBanner = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const Banner = (0, getTenantModel_1.getTenantModel)(req, 'Banner', banner_model_1.bannerSchema);
    const result = yield Banner.create(payload);
    return result;
});
const getAllBanners = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const Banner = (0, getTenantModel_1.getTenantModel)(req, 'Banner', banner_model_1.bannerSchema);
    const result = yield Banner.find({ isActive: true });
    return result;
});
const updateBanner = (req, id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const Banner = (0, getTenantModel_1.getTenantModel)(req, 'Banner', banner_model_1.bannerSchema);
    const result = yield Banner.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const deleteBanner = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const Banner = (0, getTenantModel_1.getTenantModel)(req, 'Banner', banner_model_1.bannerSchema);
    const result = yield Banner.findByIdAndDelete(id);
    return result;
});
exports.bannerService = {
    createBanner,
    getAllBanners,
    updateBanner,
    deleteBanner
};
