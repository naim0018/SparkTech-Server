"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookPixelRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../app/middleware/validateRequest"));
const facebookPixel_controller_1 = require("./facebookPixel.controller");
const facebookPixel_validation_1 = require("./facebookPixel.validation");
const router = (0, express_1.Router)();
router.get('/', facebookPixel_controller_1.facebookPixelController.getFacebookPixel);
router.post('/', (0, validateRequest_1.default)(facebookPixel_validation_1.FacebookPixelValidation.updateFacebookPixelSchemaZod), facebookPixel_controller_1.facebookPixelController.createFacebookPixel);
router.patch('/', (0, validateRequest_1.default)(facebookPixel_validation_1.FacebookPixelValidation.updateFacebookPixelSchemaZod), facebookPixel_controller_1.facebookPixelController.updateFacebookPixel);
router.delete('/', facebookPixel_controller_1.facebookPixelController.deleteFacebookPixel);
exports.FacebookPixelRoutes = router;
