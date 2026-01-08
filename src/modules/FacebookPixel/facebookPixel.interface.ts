import { Document } from "mongoose";

export interface IFacebookPixel extends Document {
    pixelId: string;
    accessToken?: string;
}
