import { AppError } from "../utils/AppError";
import { db } from "./../config/database.config";

import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { authConfig } from "../config/auth.config";

import { tokens, users } from "../models/schema";
import { User } from "../types";
import {
  generateRefreshToken,
  generateToken,
  TokenPayload,
} from "../utils/jwt.util";
import { hashPassword, verifyPassword } from "../utils/password.util";
import { validateEmail, validatePassword } from "../utils/validation.util";

const validateUserInput = (email: string, password: string): void => {
  if (!validateEmail(email)) {
    throw AppError.BadRequest("Invalid email format", {
      email: "Invalid email format",
    });
  }

  if (!validatePassword(password)) {
    throw AppError.BadRequest("Password does not meet requirements", {
      password:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
    });
  }
};

const checkExistingUser = async (email: string): Promise<void> => {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute()
    .then((rows) => rows[0])
    .catch((error) => {
      console.error("Database error:", error); // Log the actual error
      throw AppError.InternalServer(
        "Database error while checking existing user"
      );
    });

  if (existingUser) {
    throw AppError.Conflict("Email already registered", {
      email: "Email is already in use",
    });
  }
};

const createUser = async (
  email: string,
  hashedPassword: string
): Promise<User> => {
  const user = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
    .execute()
    .then(
      (
        rows: {
          id: string;
          email: string;
          password: string;
          role: string;
          lastLoginAt: Date | null;
          createdAt: Date | null;
          updatedAt: Date | null;
        }[]
      ) => rows[0]
    )
    .catch(() => {
      throw AppError.InternalServer("Database error while registering user");
    });

  return {
    id: user.id,
    email: user.email,
    password: user.password,
    role: user.role,
    lastLoginAt: user.lastLoginAt || undefined,
    createdAt: user.createdAt || undefined,
    updatedAt: user.updatedAt || undefined,
  };
};

export const register = async (
  email: string,
  password: string
): Promise<User> => {
  validateUserInput(email, password);
  await checkExistingUser(email);
  const hashedPassword = await hashPassword(password);
  return createUser(email, hashedPassword);
};

const findUserByEmail = async (email: string) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();
    return result[0];
  } catch (error) {
    console.error("Database error in findUserByEmail:", error);
    throw AppError.InternalServer(
      "An error occurred while processing your request"
    );
  }
};

const createTokens = async (
  user: User
): Promise<{ accessToken: string; refreshToken: string }> => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + authConfig.refreshTokenExpiration);
  await db.insert(tokens).values({
    id: crypto.randomUUID(),
    token: refreshToken,
    type: "refresh",
    userId: user.id,
    expiresAt,
    isRevoked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { accessToken, refreshToken };
};

const updateLastLogin = async (userId: string): Promise<void> => {
  const currentTime = new Date();
  // Ensure the date is valid before updating
  if (isNaN(currentTime.getTime())) {
    throw new Error("Invalid timestamp generated");
  }
  await db
    .update(users)
    .set({ lastLoginAt: currentTime })
    .where(eq(users.id, userId));
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  try {
    const dbUser = await findUserByEmail(email);
    if (!dbUser) {
      throw AppError.NotFound("User not found", {
        email: "No user found with this email",
      });
    }

    const isValidPassword = await verifyPassword(password, dbUser.password);
    if (!isValidPassword) {
      throw AppError.Unauthorized("Invalid credentials", {
        password: "Incorrect password",
      });
    }

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      password: dbUser.password,
      role: dbUser.role,
      lastLoginAt: dbUser.lastLoginAt || undefined,
      createdAt: dbUser.createdAt || undefined,
      updatedAt: dbUser.updatedAt || undefined,
    };

    const tokens = await createTokens(user);
    await updateLastLogin(user.id);

    return { user, ...tokens };
  } catch (error) {
    console.error("Error in login:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.InternalServer(
      "An error occurred while processing your request"
    );
  }
};

const getTokenData = async (refreshToken: string) => {
  interface TokenData {
    tokens: {
      id: string;
      token: string;
      type: string;
      userId: string;
      expiresAt: Date;
      isRevoked: boolean;
      createdAt: Date | null;
      updatedAt: Date | null;
    } | null;
    users: {
      id: string;
      email: string;
      password: string;
      role: string;
      lastLoginAt: Date | null;
      createdAt: Date | null;
      updatedAt: Date | null;
    } | null;
  }

  return db
    .select()
    .from(tokens)
    .where(and(eq(tokens.token, refreshToken), eq(tokens.isRevoked, false)))
    .leftJoin(users, eq(tokens.userId, users.id))
    .execute()
    .then((rows) => rows[0] as TokenData)
    .catch(() => {
      throw AppError.InternalServer(
        "Database error while validating refresh token"
      );
    });
};

const revokeToken = async (refreshToken: string): Promise<void> => {
  await db
    .update(tokens)
    .set({ isRevoked: true })
    .where(eq(tokens.token, refreshToken));
};

export const refreshToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const tokenData = await getTokenData(refreshToken);

  if (
    !tokenData ||
    !tokenData.tokens ||
    !tokenData.users ||
    tokenData.tokens.expiresAt < new Date()
  ) {
    throw AppError.Unauthorized("Invalid or expired refresh token");
  }

  const payload: TokenPayload = {
    userId: tokenData.users.id,
    email: tokenData.users.email,
    role: tokenData.users.role,
  };

  const newAccessToken = generateToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await revokeToken(refreshToken);

  const expiresAt = new Date(Date.now() + authConfig.refreshTokenExpiration);
  await db.insert(tokens).values({
    id: crypto.randomUUID(),
    token: newRefreshToken,
    type: "refresh",
    userId: tokenData.users.id,
    expiresAt,
    isRevoked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken: string): Promise<void> => {
  await revokeToken(refreshToken);
};
