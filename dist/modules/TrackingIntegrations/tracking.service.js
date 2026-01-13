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
exports.TrackingServices = void 0;
const tracking_model_1 = require("./tracking.model");
// Get the single tracking document, or create it if not exists
const getTrackingSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    let settings = yield tracking_model_1.Tracking.findOne();
    if (!settings) {
        settings = yield tracking_model_1.Tracking.create({});
    }
    return settings;
});
const updateTrackingSettings = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let settings = yield tracking_model_1.Tracking.findOne();
    if (!settings) {
        settings = yield tracking_model_1.Tracking.create(payload);
    }
    else {
        settings = yield tracking_model_1.Tracking.findByIdAndUpdate(settings._id, payload, {
            new: true,
            runValidators: true,
        });
    }
    return settings;
});
exports.TrackingServices = {
    getTrackingSettings,
    updateTrackingSettings,
};
