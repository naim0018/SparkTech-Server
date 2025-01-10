import express from "express";
import { UserController } from "./user.controller";

import { UserValidation } from "./user.validation";
import validateRequest from "../../app/middleware/validateRequest";

const router = express.Router();

router.post(
  "/create-user",
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser
);

router.get("/all-users", UserController.getAllUsers);

router.get("/:id", UserController.getUserById);
router.get("/user-by-email/:email", UserController.getUserByEmail);

router.patch(
  "/:id",
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateUser
);

router.delete("/:id", UserController.deleteUser);

export const UserRoutes = router;
