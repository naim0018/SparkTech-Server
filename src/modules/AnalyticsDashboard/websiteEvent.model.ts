import { Schema } from "mongoose";

export interface IWebsiteEvent {
  event: string;
  timestamp: Date;
  path: string;
  ip: string;
  device: "Mobile" | "Tablet" | "Desktop";
  payload: Record<string, any>;
  user?: {
    name?: string;
    email?: string;
  };
  referrer?: string;
  userAgent?: string;
}

export const websiteEventSchema = new Schema<IWebsiteEvent>(
  {
    event: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    path: { type: String, required: true },
    ip: { type: String, default: "127.0.0.1", index: true },
    device: { type: String, enum: ["Mobile", "Tablet", "Desktop"], default: "Desktop" },
    payload: { type: Schema.Types.Mixed, default: {} },
    user: {
      name: { type: String },
      email: { type: String },
    },
    referrer: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast tenant query with pagination by event and timestamp
websiteEventSchema.index({ event: 1, createdAt: -1 });
websiteEventSchema.index({ createdAt: -1 });
