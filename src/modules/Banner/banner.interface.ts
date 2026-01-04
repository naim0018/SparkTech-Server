import { Document } from "mongoose";

export interface IBanner extends Document {
    type: string; // 'hero', 'top-right', 'middle-right', 'bottom-left', 'bottom-middle'
    title: string;
    description?: string;
    productId: string;
    image: string;
    isActive: boolean;
}
