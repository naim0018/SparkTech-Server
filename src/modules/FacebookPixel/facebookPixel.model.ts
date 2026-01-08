import { Schema, model } from "mongoose";
import { IFacebookPixel } from "./facebookPixel.interface";

const facebookPixelSchema = new Schema<IFacebookPixel>({
    pixelId: { type: String, default: "" },
    accessToken: { type: String, default: "" },
}, {
    timestamps: true
});

export const FacebookPixel = model<IFacebookPixel>('FacebookPixel', facebookPixelSchema);
