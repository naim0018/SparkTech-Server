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
exports.googleAnalyticsService = void 0;
const googleAnalytics_model_1 = require("./googleAnalytics.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const createGoogleAnalytics = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const GoogleAnalytics = (0, getTenantModel_1.getTenantModel)(req, 'GoogleAnalytics', googleAnalytics_model_1.googleAnalyticsSchema);
    const isExist = yield GoogleAnalytics.findOne({});
    if (isExist) {
        throw new Error("Google Analytics config already exists. Use update instead.");
    }
    const result = yield GoogleAnalytics.create({ googleAnalyticsId: id });
    return result;
});
const getGoogleAnalytics = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const GoogleAnalytics = (0, getTenantModel_1.getTenantModel)(req, 'GoogleAnalytics', googleAnalytics_model_1.googleAnalyticsSchema);
    const result = yield GoogleAnalytics.findOne({});
    return result;
});
const updateGoogleAnalytics = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const GoogleAnalytics = (0, getTenantModel_1.getTenantModel)(req, 'GoogleAnalytics', googleAnalytics_model_1.googleAnalyticsSchema);
    const result = yield GoogleAnalytics.findOneAndUpdate({}, { googleAnalyticsId: id }, { new: true });
    return result;
});
const deleteGoogleAnalytics = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const GoogleAnalytics = (0, getTenantModel_1.getTenantModel)(req, 'GoogleAnalytics', googleAnalytics_model_1.googleAnalyticsSchema);
    const result = yield GoogleAnalytics.findOneAndUpdate({}, { googleAnalyticsId: "" }, { new: true });
    return result;
});
exports.googleAnalyticsService = {
    createGoogleAnalytics,
    getGoogleAnalytics,
    updateGoogleAnalytics,
    deleteGoogleAnalytics
};
