import { Schema, model } from "mongoose";
import { IBanner } from "./banner.interface";

const bannerSchema = new Schema<IBanner>({
    type: { type: String, required: true },
    title: { type: String },
    subtitle: { type: String },
    description: { type: String },
    link: { type: String },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    buttonText: { type: String },
    buttonBgColor: { type: String },
    buttonTextColor: { type: String },
    textColor: { type: String },
    textPosition: { type: String, default: 'center' },
    titleSize: { type: String },
    subtitleSize: { type: String },
    showButton: { type: Boolean, default: true },
    showTitle: { type: Boolean, default: true }
}, {
    timestamps: true
});

export { bannerSchema };
export const Banner = model<IBanner>('Banner', bannerSchema);
