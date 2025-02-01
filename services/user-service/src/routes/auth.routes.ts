import { Router } from "express";
import { z } from "zod";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validation.middleware";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Routes
router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh-token", validateBody(refreshTokenSchema), refreshToken);
router.post("/logout", validateBody(refreshTokenSchema), logout);

export default router;
