import { pgTable, serial, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // email, sms, push
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, sent, failed
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;