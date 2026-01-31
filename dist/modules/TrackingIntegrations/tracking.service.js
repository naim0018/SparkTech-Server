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
const getTenantModel_1 = require("../../app/utils/getTenantModel");
// Get the single tracking document, or create it if not exists
const getTrackingSettings = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const Tracking = (0, getTenantModel_1.getTenantModel)(req, 'Tracking', tracking_model_1.trackingSchema);
    let settings = yield Tracking.findOne();
    if (!settings) {
        settings = yield Tracking.create({});
    }
    return settings;
});
const updateTrackingSettings = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const Tracking = (0, getTenantModel_1.getTenantModel)(req, 'Tracking', tracking_model_1.trackingSchema);
    let settings = yield Tracking.findOne();
    if (!settings) {
        settings = yield Tracking.create(payload);
    }
    else {
        settings = yield Tracking.findByIdAndUpdate(settings._id, payload, {
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
