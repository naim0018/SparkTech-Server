import { Schema, model, Document, Types } from 'mongoose';

export interface IStore extends Document {
  name: string;
  domains: string[];
  identity: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
  };
  settings: {
    currency: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
    gtmId?: string; // Google Tag Manager ID
    facebookPixelId?: string;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const storeSchema = new Schema<IStore>(
  {
    name: { type: String, required: true },
    domains: { type: [String], required: true, index: true },
    identity: {
      logoUrl: { type: String, required: true },
      faviconUrl: { type: String, required: true },
      primaryColor: { type: String, default: '#0046be' },
      secondaryColor: { type: String, default: '#ffeb3b' },
    },
    settings: {
      currency: { type: String, default: 'BDT' },
      supportEmail: { type: String, required: true },
      supportPhone: { type: String, required: true },
      address: { type: String, required: true },
      gtmId: { type: String },
      facebookPixelId: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const StoreModel = model<IStore>('Store', storeSchema);
