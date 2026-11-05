"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const validateRequest_1 = __importDefault(require("../../app/middleware/validateRequest"));
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("./user.constant");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const router = express_1.default.Router();
// Public user registration
router.post("/create-user", upload.single("file"), (req, res, next) => {
    if (req.file) {
        req.body.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
    next();
}, (0, validateRequest_1.default)(user_validation_1.UserValidation.createUserZodSchema), user_controller_1.UserController.createUser);
// Admin-only user directory listing and deletion
router.get("/all-users", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), user_controller_1.UserController.getAllUsers);
router.delete("/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), user_controller_1.UserController.deleteUser);
// Authenticated user profile routes
router.get("/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.USER), user_controller_1.UserController.getUserById);
router.get("/user-by-email/:email", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.USER), user_controller_1.UserController.getUserByEmail);
router.patch("/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.USER), upload.single("file"), (req, res, next) => {
    if (req.file) {
        req.body.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
    next();
}, (0, validateRequest_1.default)(user_validation_1.UserValidation.updateUserZodSchema), user_controller_1.UserController.updateUser);
exports.UserRoutes = router;
