import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.model";

export const tokens = pgTable("tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: varchar("token").notNull(),
  type: varchar("type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
});

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}));

export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;
