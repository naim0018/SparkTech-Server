import { Request } from 'express';
import { SettingsModel } from './settings.model';
import { getTenantModel } from '../../app/utils/getTenantModel';
import { ISettings, ITheme } from './settings.interface';

// Default presets to initialize if none exist
const DEFAULT_THEMES: ITheme[] = [
  {
    id: "default",
    name: "Indigo",
    previewColor: "#6366f1",
    isPreset: true,
    className: "",
    variables: {
        '--brand-50': '#eef2ff',
        '--brand-100': '#e0e7ff',
        '--brand-200': '#c7d2fe',
        '--brand-500': '#6366f1',
        '--brand-600': '#4f46e5',
        '--brand-700': '#4338ca',
        '--brand-shadow': 'rgba(79, 70, 229, 0.15)'
    }
  },
  {
    id: "emerald",
    name: "Emerald",
    previewColor: "#10b981",
    isPreset: true,
    className: "theme-emerald",
    variables: {
        '--brand-50': '#ecfdf5',
        '--brand-100': '#d1fae5',
        '--brand-200': '#a7f3d0',
        '--brand-500': '#10b981',
        '--brand-600': '#059669',
        '--brand-700': '#047857',
        '--brand-shadow': 'rgba(5, 150, 105, 0.15)'
    }
  },
  {
    id: "rose",
    name: "Rose",
    previewColor: "#f43f5e",
    isPreset: true,
    className: "theme-rose",
    variables: {
        '--brand-50': '#fff1f2',
        '--brand-100': '#ffe4e6',
        '--brand-200': '#fecdd3',
        '--brand-500': '#f43f5e',
        '--brand-600': '#e11d48',
        '--brand-700': '#be123c',
        '--brand-shadow': 'rgba(225, 29, 72, 0.15)'
    }
  },
  {
    id: "violet",
    name: "Violet",
    previewColor: "#8b5cf6",
    isPreset: true,
    className: "theme-violet",
    variables: {
        '--brand-50': '#f5f3ff',
        '--brand-100': '#ede9fe',
        '--brand-200': '#ddd6fe',
        '--brand-500': '#8b5cf6',
        '--brand-600': '#7c3aed',
        '--brand-700': '#6d28d9',
        '--brand-shadow': 'rgba(124, 58, 237, 0.15)'
    }
  },
  {
    id: "amber",
    name: "Amber",
    previewColor: "#f59e0b",
    isPreset: true,
    className: "theme-amber",
    variables: {
        '--brand-50': '#fffbeb',
        '--brand-100': '#fef3c7',
        '--brand-200': '#fde68a',
        '--brand-500': '#f59e0b',
        '--brand-600': '#d97706',
        '--brand-700': '#b45309',
        '--brand-shadow': 'rgba(217, 119, 6, 0.15)'
    }
  }
];

export const getSettings = async (req: Request) => {
  const Settings = getTenantModel<ISettings>(req, 'Settings', SettingsModel.schema);
  
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({
      activeThemeId: 'default',
      themes: DEFAULT_THEMES
    });
  }

  // Ensure default themes always exist (in case of updates)
  // Logic could be added here to merge DEFAULT_THEMES if missing

  return settings;
};

export const updateActiveTheme = async (req: Request, themeId: string) => {
  const Settings = getTenantModel<ISettings>(req, 'Settings', SettingsModel.schema);
  const settings = await Settings.findOne();
  if (!settings) throw new Error("Settings not initialized");

  const themeExists = settings.themes.some(t => t.id === themeId);
  if (!themeExists) throw new Error("Theme not found");

  settings.activeThemeId = themeId;
  await settings.save();
  return settings;
};

export const addCustomTheme = async (req: Request, theme: ITheme) => {
  const Settings = getTenantModel<ISettings>(req, 'Settings', SettingsModel.schema);
  const settings = await getSettings(req);
  
  // Prevent duplicate IDs
  if (settings.themes.some(t => t.id === theme.id)) {
    throw new Error("Theme ID already exists");
  }

  settings.themes.push(theme);
  await settings.save();
  return settings;
};

export const deleteCustomTheme = async (req: Request, themeId: string) => {
    const Settings = getTenantModel<ISettings>(req, 'Settings', SettingsModel.schema);
    const settings = await getSettings(req);

    const themeIndex = settings.themes.findIndex(t => t.id === themeId);
    if (themeIndex === -1) throw new Error("Theme not found");
    
    if (settings.themes[themeIndex].isPreset) {
        throw new Error("Cannot delete preset themes");
    }

    settings.themes.splice(themeIndex, 1);
    
    // Reset to default if active theme was deleted
    if (settings.activeThemeId === themeId) {
        settings.activeThemeId = 'default';
    }

    await settings.save();
    return settings;
}

export const SettingsService = {
  getSettings,
  updateActiveTheme,
  addCustomTheme,
  deleteCustomTheme
};
