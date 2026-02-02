export interface IThemeVariables {
  '--brand-50': string;
  '--brand-100': string;
  '--brand-200': string;
  '--brand-500': string;
  '--brand-600': string;
  '--brand-700': string;
  '--brand-shadow': string;
}

export interface ITheme {
  id: string;
  name: string;
  previewColor: string; // Hex color for the UI circle
  isPreset: boolean;
  variables: IThemeVariables;
  className?: string; // For CSS-based presets like 'theme-emerald'
}

export interface ISettings {
  themes: ITheme[];
  activeThemeId: string;
}
