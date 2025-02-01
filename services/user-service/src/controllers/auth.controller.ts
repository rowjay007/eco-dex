import { Request, Response } from "express";
import {
  login as loginService,
  logout as logoutService,
  refreshToken as refreshTokenService,
  register as registerService,
} from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await registerService(email, password);
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { id: user.id, email: user.email },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await loginService(
    email,
    password
  );
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: { id: user.id, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken },
    },
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await refreshTokenService(refreshToken);
    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: tokens,
    });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await logoutService(refreshToken);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
