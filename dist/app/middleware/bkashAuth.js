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
const axios_1 = __importDefault(require("axios"));
class middleware {
    constructor() {
        this.bkash_auth = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (globalThis.userEmails) {
                globalThis.userEmails = "";
            }
            try {
                const { data } = yield axios_1.default.post(process.env.bkash_grant_token_url, {
                    app_key: process.env.bkash_api_key,
                    app_secret: process.env.bkash_secret_key,
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        username: process.env.bkash_username,
                        password: process.env.bkash_password,
                    }
                });
                globalThis.id_token = data.id_token;
                next();
            }
            catch (error) {
                if (error instanceof Error) {
                    return res.status(401).json({ error: error.message });
                }
                return res.status(401).json({ error: 'Unknown error occurred' });
            }
        });
    }
}
exports.default = new middleware();
