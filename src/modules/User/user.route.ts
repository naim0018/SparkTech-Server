import express from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import validateRequest from "../../app/middleware/validateRequest";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "./user.constant";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Public user registration
router.post(
  "/create-user",
  upload.single("file"),
  (req, res, next) => {
    if (req.file) {
      req.body.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
    next();
  },
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser
);

// Admin-only user directory listing and deletion
router.get("/all-users", auth(USER_ROLE.ADMIN as "admin"), UserController.getAllUsers);
router.delete("/:id", auth(USER_ROLE.ADMIN as "admin"), UserController.deleteUser);

// Authenticated user profile routes
router.get(
  "/:id",
  auth(USER_ROLE.ADMIN as "admin", USER_ROLE.USER as "user"),
  UserController.getUserById
);
router.get(
  "/user-by-email/:email",
  auth(USER_ROLE.ADMIN as "admin", USER_ROLE.USER as "user"),
  UserController.getUserByEmail
);
router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN as "admin", USER_ROLE.USER as "user"),
  upload.single("file"),
  (req, res, next) => {
    if (req.file) {
      req.body.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
    next();
  },
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateUser
);

export const UserRoutes = router;
