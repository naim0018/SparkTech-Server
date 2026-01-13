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
const createFacebookPixel = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield facebookPixel_model_1.FacebookPixel.findOne({});
    if (isExist) {
        throw new Error("Facebook Pixel config already exists. Use update instead.");
    }
    const result = yield facebookPixel_model_1.FacebookPixel.create(payload);
    return result;
});
const getFacebookPixel = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield facebookPixel_model_1.FacebookPixel.findOne({});
    return result;
});
const updateFacebookPixel = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield facebookPixel_model_1.FacebookPixel.findOneAndUpdate({}, payload, { new: true });
    return result;
});
const deleteFacebookPixel = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield facebookPixel_model_1.FacebookPixel.findOneAndUpdate({}, { pixelId: "", accessToken: "" }, { new: true });
    return result;
});
exports.facebookPixelService = {
    createFacebookPixel,
    getFacebookPixel,
    updateFacebookPixel,
    deleteFacebookPixel
};
