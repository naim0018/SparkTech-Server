import { model, Schema } from 'mongoose';
import { ISettings, ITheme } from './settings.interface';

const ThemeVariablesSchema = new Schema({
  '--brand-50': { type: String, required: true },
  '--brand-100': { type: String, required: true },
  '--brand-200': { type: String, required: true },
  '--brand-500': { type: String, required: true },
  '--brand-600': { type: String, required: true },
  '--brand-700': { type: String, required: true },
  '--brand-shadow': { type: String, required: true },
}, { _id: false });

const ThemeSchema = new Schema<ITheme>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  previewColor: { type: String, required: true },
  isPreset: { type: Boolean, default: false },
  className: { type: String },
  variables: { type: ThemeVariablesSchema, required: true }
}, { _id: false });

const SettingsSchema = new Schema<ISettings>({
  activeThemeId: { type: String, default: 'default' },
  themes: { type: [ThemeSchema], default: [] } 
}, { timestamps: true });

export const SettingsModel = model<ISettings>('Settings', SettingsSchema);
