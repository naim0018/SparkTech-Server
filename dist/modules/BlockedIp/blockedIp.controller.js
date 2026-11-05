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
exports.BlockedIpController = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsync_1 = __importDefault(require("../../app/utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../app/utils/sendResponse"));
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const blockedIp_model_1 = require("./blockedIp.model");
const AppError_1 = __importDefault(require("../../app/error/AppError"));
const ipBlocker_1 = require("../../app/middleware/ipBlocker");
const getAllBlockedIps = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const BlockedIpModel = (0, getTenantModel_1.getTenantModel)(req, "BlockedIp", blockedIp_model_1.blockedIpSchema);
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const filter = {};
    if (search && typeof search === "string" && search.trim()) {
        // Escape regex special characters to prevent ReDoS & syntax crashes
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escapedSearch, "i");
        filter.$or = [{ ip: searchRegex }, { reason: searchRegex }, { blockedBy: searchRegex }];
    }
    const [data, total] = yield Promise.all([
        BlockedIpModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        BlockedIpModel.countDocuments(filter),
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Blocked IPs retrieved successfully",
        meta: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPage: Math.ceil(total / limitNum) || 1,
        },
        data,
    });
}));
const blockIp = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const BlockedIpModel = (0, getTenantModel_1.getTenantModel)(req, "BlockedIp", blockedIp_model_1.blockedIpSchema);
    const { ip, reason, scope = "all" } = req.body;
    if (!ip || typeof ip !== "string" || !ip.trim()) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "A valid IP address is required.");
    }
    const cleanIp = (0, ipBlocker_1.normalizeIp)(ip);
    // Validate IP address format (IPv4 or IPv6)
    if (!(0, ipBlocker_1.isValidIp)(cleanIp)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `"${ip}" is not a valid IPv4 or IPv6 address (e.g. 103.145.74.12).`);
    }
    // Prevent blocking localhost loopbacks to avoid breaking local development
    if ((0, ipBlocker_1.isLoopbackIp)(cleanIp)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot block local development loopback address.");
    }
    // Prevent admin from blocking their own active IP address to avoid lockout
    const currentAdminIp = (0, ipBlocker_1.getClientIp)(req);
    if (cleanIp === currentAdminIp) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Cannot block your current IP address (${cleanIp}) to prevent administrator lockout.`);
    }
    const adminName = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) || "Admin";
    const result = yield BlockedIpModel.findOneAndUpdate({ ip: cleanIp }, {
        ip: cleanIp,
        reason: (reason === null || reason === void 0 ? void 0 : reason.trim()) || "Suspicious or abusive activity",
        scope: scope === "checkout" ? "checkout" : "all",
        blockedBy: adminName,
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    // Invalidate tenant IP cache so changes take effect immediately without waiting for TTL
    (0, ipBlocker_1.invalidateTenantIpCache)(req.dbName);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: `IP ${cleanIp} has been blocked successfully (${scope === "checkout" ? "Checkout Only" : "Entire Site"}).`,
        data: result,
    });
}));
const unblockIp = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const BlockedIpModel = (0, getTenantModel_1.getTenantModel)(req, "BlockedIp", blockedIp_model_1.blockedIpSchema);
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid blocked IP record identifier.");
    }
    const result = yield BlockedIpModel.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Blocked IP record not found.");
    }
    // Invalidate tenant IP cache so unblocked IP can access immediately
    (0, ipBlocker_1.invalidateTenantIpCache)(req.dbName);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "IP address has been unblocked successfully.",
        data: result,
    });
}));
exports.BlockedIpController = {
    getAllBlockedIps,
    blockIp,
    unblockIp,
};
