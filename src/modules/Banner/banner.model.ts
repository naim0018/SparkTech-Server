import { Schema, model } from "mongoose";
import { IBanner } from "./banner.interface";

const bannerSchema = new Schema<IBanner>({
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    productId: { type: String, required: true }, // Store ID as string for flexibility, typically generic Product ID or link
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export { bannerSchema };
export const Banner = model<IBanner>('Banner', bannerSchema);
