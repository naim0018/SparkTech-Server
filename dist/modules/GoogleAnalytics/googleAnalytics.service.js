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
const createGoogleAnalytics = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield googleAnalytics_model_1.GoogleAnalytics.findOne({});
    if (isExist) {
        throw new Error("Google Analytics config already exists. Use update instead.");
    }
    const result = yield googleAnalytics_model_1.GoogleAnalytics.create({ googleAnalyticsId: id });
    return result;
});
const getGoogleAnalytics = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield googleAnalytics_model_1.GoogleAnalytics.findOne({});
    return result;
});
const updateGoogleAnalytics = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield googleAnalytics_model_1.GoogleAnalytics.findOneAndUpdate({}, { googleAnalyticsId: id }, { new: true });
    return result;
});
const deleteGoogleAnalytics = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield googleAnalytics_model_1.GoogleAnalytics.findOneAndUpdate({}, { googleAnalyticsId: "" }, { new: true });
    return result;
});
exports.googleAnalyticsService = {
    createGoogleAnalytics,
    getGoogleAnalytics,
    updateGoogleAnalytics,
    deleteGoogleAnalytics
};
