import { Schema, Document } from "mongoose";

export type BlockScope = "all" | "checkout";

export interface IBlockedIp extends Document {
  ip: string;
  reason?: string;
  scope: BlockScope; // "all" = block entire site (403), "checkout" = block order placement only
  blockedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const blockedIpSchema = new Schema<IBlockedIp>(
  {
    ip: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      default: "Suspicious or abusive activity",
      trim: true,
    },
    scope: {
      type: String,
      enum: ["all", "checkout"],
      default: "all",
      required: true,
    },
    blockedBy: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Unique per-tenant index for IP + Scope
blockedIpSchema.index({ ip: 1 }, { unique: true });
