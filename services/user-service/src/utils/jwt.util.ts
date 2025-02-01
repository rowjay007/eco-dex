import jwt, { Secret, SignOptions } from "jsonwebtoken";
import authConfig from "../config/auth.config";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = authConfig.jwtSecret;
  const options: SignOptions = {
    expiresIn: authConfig.jwtExpiration,
  };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const secret: Secret = authConfig.jwtSecret;
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = authConfig.jwtSecret;
  const options: SignOptions = {
    expiresIn: authConfig.refreshTokenExpiration,
  };
  return jwt.sign(payload, secret, options);
};
