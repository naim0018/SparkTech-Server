"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bkashRouter = void 0;
const express_1 = __importDefault(require("express"));
const bkash_controller_1 = __importDefault(require("./bkash.controller"));
const bkashAuth_1 = __importDefault(require("../../app/middleware/bkashAuth"));
const router = express_1.default.Router();
router.post('/payment/create', bkashAuth_1.default.bkash_auth, bkash_controller_1.default.payment_create);
router.get('/payment/callback', bkashAuth_1.default.bkash_auth, bkash_controller_1.default.call_back);
router.get('/payment/refund/:trxID', bkashAuth_1.default.bkash_auth, bkash_controller_1.default.refund);
exports.bkashRouter = router;
