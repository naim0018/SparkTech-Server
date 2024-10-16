"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    NODE_ENV: process.env.NODE_ENV,
    port: process.env.port,
    db: process.env.db,
    jwt_access_secret: process.env.jwt_access_secret,
    jwt_access_expires_in: process.env.jwt_access_expires_in,
    jwt_refresh_secret: process.env.jwt_refresh_secret,
    jwt_refresh_expires_in: process.env.jwt_refresh_expires_in,
    bcrypt_salt_rounds: process.env.bcrypt_salt_rounds,
    reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
};
