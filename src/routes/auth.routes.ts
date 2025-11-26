import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);

// password reset
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;
