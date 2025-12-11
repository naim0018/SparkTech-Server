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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const bkash_model_1 = __importDefault(require("./bkash.model"));
const config_1 = __importDefault(require("../../app/config"));
const baseURL = config_1.default.baseURL;
class PaymentController {
    constructor() {
        this.payment_create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { amount, userEmail } = req.body;
            try {
                const { data } = yield axios_1.default.post(config_1.default.bkash_create_payment_url, {
                    mode: "0011",
                    payerReference: userEmail,
                    callbackURL: `${config_1.default.callbackURL}`,
                    amount,
                    currency: "BDT",
                    intent: "sale",
                    merchantInvoiceNumber: "Inv" + (0, uuid_1.v4)().substring(0, 5),
                }, {
                    headers: yield this.bkash_headers(),
                });
                return res.status(200).json({ bkashURL: data.bkashURL });
            }
            catch (error) {
                if (error instanceof Error) {
                    return res.status(401).json({ error: error.message });
                }
                return res.status(401).json({ error: 'Unknown error occurred' });
            }
        });
        this.call_back = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { paymentID, status } = req.query;
            if (status === "cancel" || status === "failure") {
                return res.redirect(`${baseURL}/error?message=${encodeURIComponent(status)}`);
            }
            if (status === "success") {
                try {
                    const { data } = yield axios_1.default.post(config_1.default.bkash_execute_payment_url, { paymentID }, {
                        headers: yield this.bkash_headers(),
                    });
                    if (data && data.statusCode === "0000") {
                        yield bkash_model_1.default.create({
                            userId: Math.random() * 10 + 1,
                            paymentID,
                            trxID: data.trxID,
                            date: data.paymentExecuteTime,
                            amount: parseInt(data.amount),
                        });
                        return res.redirect(`${baseURL}/checkout?message=${encodeURIComponent(data.statusMessage)}&trxID=${encodeURIComponent(data.trxID)}&amount=${encodeURIComponent(data.amount)}`);
                    }
                    else {
                        return res.redirect(`${baseURL}/checkout?message=${encodeURIComponent(data.statusMessage)}`);
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    return res.redirect(`${baseURL}/error?message=${encodeURIComponent(errorMessage)}`);
                }
            }
        });
        this.refund = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { trxID } = req.params;
            try {
                const payment = yield bkash_model_1.default.findOne({ trxID });
                const { data } = yield axios_1.default.post(config_1.default.bkash_refund_transaction_url, {
                    paymentID: payment === null || payment === void 0 ? void 0 : payment.paymentID,
                    amount: payment === null || payment === void 0 ? void 0 : payment.amount,
                    trxID,
                    sku: "payment",
                    reason: "cashback",
                }, {
                    headers: yield this.bkash_headers(),
                });
                if (data && data.statusCode === "0000") {
                    return res.status(200).json({ message: "refund success" });
                }
                else {
                    return res.status(404).json({ error: "refund failed" });
                }
            }
            catch (error) {
                return res.status(404).json({ error: "refund failed" });
            }
        });
    }
    bkash_headers() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: globalThis.id_token,
                "x-app-key": config_1.default.bkash_api_key,
            };
        });
    }
}
exports.default = new PaymentController();
