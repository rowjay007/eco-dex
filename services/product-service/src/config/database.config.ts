import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as categorySchema from "../models/category.model.js";
import * as inventorySchema from "../models/inventory.model.js";
import * as productSchema from "../models/product.model.js";

config({ path: ".env" });

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, {
  schema: { ...productSchema, ...inventorySchema, ...categorySchema },
});
