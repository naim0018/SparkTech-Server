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
exports.facebookPixelService = void 0;
const facebookPixel_model_1 = require("./facebookPixel.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const createFacebookPixel = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const FacebookPixel = (0, getTenantModel_1.getTenantModel)(req, 'FacebookPixel', facebookPixel_model_1.facebookPixelSchema);
    const isExist = yield FacebookPixel.findOne({});
    if (isExist) {
        throw new Error("Facebook Pixel config already exists. Use update instead.");
    }
    const result = yield FacebookPixel.create(payload);
    return result;
});
const getFacebookPixel = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const FacebookPixel = (0, getTenantModel_1.getTenantModel)(req, 'FacebookPixel', facebookPixel_model_1.facebookPixelSchema);
    const result = yield FacebookPixel.findOne({});
    return result;
});
const updateFacebookPixel = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const FacebookPixel = (0, getTenantModel_1.getTenantModel)(req, 'FacebookPixel', facebookPixel_model_1.facebookPixelSchema);
    const result = yield FacebookPixel.findOneAndUpdate({}, payload, { new: true });
    return result;
});
const deleteFacebookPixel = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const FacebookPixel = (0, getTenantModel_1.getTenantModel)(req, 'FacebookPixel', facebookPixel_model_1.facebookPixelSchema);
    const result = yield FacebookPixel.findOneAndUpdate({}, { pixelId: "", accessToken: "" }, { new: true });
    return result;
});
exports.facebookPixelService = {
    createFacebookPixel,
    getFacebookPixel,
    updateFacebookPixel,
    deleteFacebookPixel
};
