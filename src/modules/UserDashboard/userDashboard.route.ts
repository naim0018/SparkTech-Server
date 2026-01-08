import { Router } from "express";
import { UserDashboardController } from "./userDashboard.controller";

import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";

const router = Router();

router.get('/stats', auth(USER_ROLE.USER as 'USER', USER_ROLE.ADMIN as 'ADMIN'), UserDashboardController.getUserStats);

export const UserDashboardRoute = router;
