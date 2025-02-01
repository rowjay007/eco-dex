import { config } from "dotenv";

config();

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpiration: "15m",
  refreshTokenExpiration: "7d",
  saltRounds: 10,
} as const;

export type AuthConfig = typeof authConfig;

export default authConfig;
