import { Request, Response } from 'express';
import { SettingsService } from './settings.service';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SettingsService.getSettings(req);
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateActiveTheme = async (req: Request, res: Response) => {
  try {
    const { themeId } = req.body;
    if (!themeId) throw new Error("Theme ID is required");
    
    const settings = await SettingsService.updateActiveTheme(req, themeId);
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addCustomTheme = async (req: Request, res: Response) => {
  try {
    const theme = req.body;
    // validation could go here
    const settings = await SettingsService.addCustomTheme(req, theme);
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteCustomTheme = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const settings = await SettingsService.deleteCustomTheme(req, id);
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

export const SettingsController = {
  getSettings,
  updateActiveTheme,
  addCustomTheme,
  deleteCustomTheme
};
