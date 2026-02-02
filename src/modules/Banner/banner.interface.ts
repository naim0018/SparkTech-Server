import { Document } from "mongoose";

export interface IBanner extends Document {
    type: string; // 'hero', 'product', 'feature', 'promotional'
    title?: string;
    subtitle?: string;
    description?: string;
    link?: string;
    image: string;
    isActive: boolean;
    buttonText?: string;
    buttonBgColor?: string;
    buttonTextColor?: string;
    textColor?: string;
    textPosition?: string; // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'
    titleSize?: string;
    subtitleSize?: string;
    showButton?: boolean;
    showTitle?: boolean;
}
