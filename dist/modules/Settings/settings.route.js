"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const settings_controller_1 = require("./settings.controller");
const tenantResolver_1 = require("../../app/middleware/tenantResolver");
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("../User/user.constant");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const router = express_1.default.Router();
// Public route to fetch settings (needed for storefront initialization)
router.get("/", tenantResolver_1.tenantResolver, settings_controller_1.SettingsController.getSettings);
// Admin-only store customization routes
router.patch("/theme", tenantResolver_1.tenantResolver, (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), settings_controller_1.SettingsController.updateActiveTheme);
router.post("/theme", tenantResolver_1.tenantResolver, (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), settings_controller_1.SettingsController.addCustomTheme);
router.delete("/theme/:id", tenantResolver_1.tenantResolver, (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), settings_controller_1.SettingsController.deleteCustomTheme);
router.patch("/admin-info", tenantResolver_1.tenantResolver, (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), upload.single("logo"), (req, res, next) => {
    if (req.file) {
        req.body.logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
    next();
}, settings_controller_1.SettingsController.updateAdminInfo);
exports.SettingsRoutes = router;
