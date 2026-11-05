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
exports.AuthServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../app/error/AppError"));
const user_model_1 = require("../User/user.model");
const auth_utils_1 = require("./auth.utils");
const config_1 = __importDefault(require("../../app/config"));
const sendEmail_1 = require("../../app/utils/sendEmail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const loginUser = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    // checking if the user is exist
    const user = yield UserModel.isUserExistsByCustomId(payload.email);
    if (!user || user == null) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user is not found!");
    }
    // checking if the user is already deleted
    const isDeleted = user === null || user === void 0 ? void 0 : user.isDeleted;
    if (isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is deleted !");
    }
    // checking if the user is blocked
    const userStatus = user === null || user === void 0 ? void 0 : user.status;
    if (userStatus === "blocked") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked ! !");
    }
    //checking if the password is correct
    if (!(yield UserModel.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.password, user === null || user === void 0 ? void 0 : user.password)))
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Password do not matched");
    //create token and sent to the  client
    const jwtPayload = {
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
        needsPasswordChange: user === null || user === void 0 ? void 0 : user.needsPasswordChange,
    };
});
const changePassword = (req, userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    // checking if the user is exist
    const user = yield UserModel.isUserExistsByCustomId(userData.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user is not found !");
    }
    // checking if the user is already deleted
    const isDeleted = user === null || user === void 0 ? void 0 : user.isDeleted;
    if (isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is deleted !");
    }
    // checking if the user is blocked
    const userStatus = user === null || user === void 0 ? void 0 : user.status;
    if (userStatus === "blocked") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked ! !");
    }
    //checking if the password is correct
    if (!(yield UserModel.isPasswordMatched(payload.currentPassword, user === null || user === void 0 ? void 0 : user.password)))
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Password do not matched");
    //hash new password
    const newHashedPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield UserModel.findOneAndUpdate({
        email: userData.email,
        role: userData.role,
    }, {
        password: newHashedPassword,
        needsPasswordChange: false,
        passwordChangedAt: new Date(),
    });
    return null;
});
const refreshToken = (req, token) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    // checking if the given token is valid
    const decoded = (0, auth_utils_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    const { email, iat } = decoded;
    // checking if the user is exist
    const user = yield UserModel.isUserExistsByCustomId(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user is not found !");
    }
    // checking if the user is already deleted
    const isDeleted = user === null || user === void 0 ? void 0 : user.isDeleted;
    if (isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is deleted !");
    }
    // checking if the user is blocked
    const userStatus = user === null || user === void 0 ? void 0 : user.status;
    if (userStatus === "blocked") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked ! !");
    }
    if (user.passwordChangedAt &&
        UserModel.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized !");
    }
    const jwtPayload = {
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return {
        accessToken,
    };
});
const forgetPassword = (req, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    // checking if the user is exist
    const user = yield UserModel.isUserExistsByCustomId(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user is not found !");
    }
    // checking if the user is already deleted
    const isDeleted = user === null || user === void 0 ? void 0 : user.isDeleted;
    if (isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is deleted !");
    }
    // checking if the user is blocked
    const userStatus = user === null || user === void 0 ? void 0 : user.status;
    if (userStatus === "blocked") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked ! !");
    }
    const jwtPayload = {
        email: user.email,
        role: user.role,
        purpose: "RESET_PASSWORD",
    };
    const resetToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, "10m");
    const resetUILink = `${config_1.default.reset_pass_ui_link}?id=${user.id}&token=${resetToken} `;
    (0, sendEmail_1.sendEmail)(user.email, resetUILink);
});
const resetPassword = (req, payload, token) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    // checking if the user is exist
    const user = yield UserModel.isUserExistsByCustomId(payload === null || payload === void 0 ? void 0 : payload.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user is not found !");
    }
    // checking if the user is already deleted
    const isDeleted = user === null || user === void 0 ? void 0 : user.isDeleted;
    if (isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is deleted !");
    }
    // checking if the user is blocked
    const userStatus = user === null || user === void 0 ? void 0 : user.status;
    if (userStatus === "blocked") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked ! !");
    }
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
    if (decoded.purpose !== "RESET_PASSWORD") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Invalid token: not authorized for password reset!");
    }
    if (payload.email !== decoded.email) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are forbidden!");
    }
    //hash new password
    const newHashedPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield UserModel.findOneAndUpdate({
        email: decoded.email,
        role: decoded.role,
    }, {
        password: newHashedPassword,
        needsPasswordChange: false,
        passwordChangedAt: new Date(),
    });
});
const googleLogin = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    // 1. Verify ID Token from Google
    let googlePayload;
    try {
        const response = yield axios_1.default.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${payload.idToken}`);
        googlePayload = response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid Google ID token!");
    }
    // Verify client ID (aud)
    const expectedClientId = (_a = config_1.default.google) === null || _a === void 0 ? void 0 : _a.clientId;
    if (googlePayload.aud !== expectedClientId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Token client ID mismatch!");
    }
    const email = googlePayload.email;
    if (!email) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Email not provided by Google!");
    }
    // 2. Check if user exists
    let user = yield UserModel.isUserExistsByCustomId(email);
    if (user) {
        if (user.isDeleted) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is deleted!");
        }
        if (user.status === "blocked") {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked!");
        }
    }
    else {
        // Register new user
        const randomPassword = (0, uuid_1.v4)();
        const newUser = {
            name: googlePayload.name || email.split("@")[0],
            email: email,
            password: randomPassword,
            needsPasswordChange: false,
            role: "user",
            status: "active",
            isDeleted: false,
            profileImage: googlePayload.picture || "",
        };
        user = yield UserModel.create(newUser);
    }
    // 3. Create tokens
    const jwtPayload = {
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
        needsPasswordChange: user.needsPasswordChange,
    };
});
exports.AuthServices = {
    loginUser,
    changePassword,
    refreshToken,
    forgetPassword,
    resetPassword,
    googleLogin,
};
