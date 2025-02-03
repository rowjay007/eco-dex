import { eq } from "drizzle-orm";
import { db } from "../config/database.config";
import { users } from "../models/schema";
import { CreateUserDTO, User } from "../types/user";

export class UserService {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return result[0] || null;
    } catch (error) {
      console.error("Error in findByEmail:", error);
      throw new Error("Database error while checking existing user");
    }
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    try {
      const [newUser] = await db.insert(users).values(userData).returning();
      return newUser;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw new Error("Database error while creating user");
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0] || null;
    } catch (error) {
      console.error("Error in findById:", error);
      throw new Error("Database error while finding user");
    }
  }
}

export const userService = new UserService();
