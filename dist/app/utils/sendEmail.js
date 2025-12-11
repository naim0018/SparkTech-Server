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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const sendEmail = (to, html) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com.',
        port: 587,
        secure: config_1.default.NODE_ENV === 'production',
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: 'mdkazinaim0018@gmail.com',
            pass: 'iikv knbg lewt sila',
        },
    });
    yield transporter.sendMail({
        from: 'mdkazinaim0018@gmail.com', // sender address
        to, // list of receivers
        subject: 'Password Reset Instructions', // Subject line
        text: 'You have requested to reset your password. Please follow the instructions provided in the HTML section of this email to complete the process within the next 10 minutes.', // plain text body
        html: `<h2>Password Reset Instructions</h2>
           <p>You have requested to reset your password. Please follow the instructions provided in this email to complete the process within the next 10 minutes.</p>
           <a href="${html}">Click here to reset your password</a>
           <p>If you did not request a password reset, please ignore this email.</p>
           <p>Best regards,</p>
           <p>SparkTech</p>`, // html body
    });
});
exports.sendEmail = sendEmail;
