import express from 'express';
import { SettingsController } from './settings.controller';
import { tenantResolver } from '../../app/middleware/tenantResolver';

const router = express.Router();

// Public route to fetch settings (needed for frontend initialization)
// Middleware tenantResolver ensures we connect to the right DB
router.get('/', tenantResolver, SettingsController.getSettings);

// Admin routes - In real app, add Auth middleware here
router.patch('/theme', tenantResolver, SettingsController.updateActiveTheme);
router.post('/theme', tenantResolver, SettingsController.addCustomTheme);
router.delete('/theme/:id', tenantResolver, SettingsController.deleteCustomTheme);

export const SettingsRoutes = router;
