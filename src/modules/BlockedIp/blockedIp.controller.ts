import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { getTenantModel } from "../../app/utils/getTenantModel";
import { blockedIpSchema } from "./blockedIp.model";
import AppError from "../../app/error/AppError";
import {
  getClientIp,
  normalizeIp,
  isValidIp,
  isLoopbackIp,
  invalidateTenantIpCache,
} from "../../app/middleware/ipBlocker";

const getAllBlockedIps = catchAsync(async (req: Request, res: Response) => {
  const BlockedIpModel = getTenantModel(req, "BlockedIp", blockedIpSchema);
  const { page = 1, limit = 20, search } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};
  if (search && typeof search === "string" && search.trim()) {
    // Escape regex special characters to prevent ReDoS & syntax crashes
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapedSearch, "i");
    filter.$or = [{ ip: searchRegex }, { reason: searchRegex }, { blockedBy: searchRegex }];
  }

  const [data, total] = await Promise.all([
    BlockedIpModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    BlockedIpModel.countDocuments(filter),
  ]);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
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
});

const blockIp = catchAsync(async (req: Request, res: Response) => {
  const BlockedIpModel = getTenantModel(req, "BlockedIp", blockedIpSchema);
  const { ip, reason, scope = "all" } = req.body;

  if (!ip || typeof ip !== "string" || !ip.trim()) {
    throw new AppError(StatusCodes.BAD_REQUEST, "A valid IP address is required.");
  }

  const cleanIp = normalizeIp(ip);

  // Validate IP address format (IPv4 or IPv6)
  if (!isValidIp(cleanIp)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `"${ip}" is not a valid IPv4 or IPv6 address (e.g. 103.145.74.12).`
    );
  }

  // Prevent blocking localhost loopbacks to avoid breaking local development
  if (isLoopbackIp(cleanIp)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Cannot block local development loopback address.");
  }

  // Prevent admin from blocking their own active IP address to avoid lockout
  const currentAdminIp = getClientIp(req);
  if (cleanIp === currentAdminIp) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Cannot block your current IP address (${cleanIp}) to prevent administrator lockout.`
    );
  }

  const adminName = (req as any).user?.name || (req as any).user?.email || "Admin";

  const result = await BlockedIpModel.findOneAndUpdate(
    { ip: cleanIp },
    {
      ip: cleanIp,
      reason: reason?.trim() || "Suspicious or abusive activity",
      scope: scope === "checkout" ? "checkout" : "all",
      blockedBy: adminName,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Invalidate tenant IP cache so changes take effect immediately without waiting for TTL
  invalidateTenantIpCache(req.dbName);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `IP ${cleanIp} has been blocked successfully (${scope === "checkout" ? "Checkout Only" : "Entire Site"}).`,
    data: result,
  });
});

const unblockIp = catchAsync(async (req: Request, res: Response) => {
  const BlockedIpModel = getTenantModel(req, "BlockedIp", blockedIpSchema);
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid blocked IP record identifier.");
  }

  const result = await BlockedIpModel.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Blocked IP record not found.");
  }

  // Invalidate tenant IP cache so unblocked IP can access immediately
  invalidateTenantIpCache(req.dbName);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "IP address has been unblocked successfully.",
    data: result,
  });
});

export const BlockedIpController = {
  getAllBlockedIps,
  blockIp,
  unblockIp,
};
