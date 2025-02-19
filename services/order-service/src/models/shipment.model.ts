import { pgTable, uuid, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { orders } from "./order.model";

export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  carrier: varchar("carrier", { length: 100 }).notNull(),
  shippingMethod: varchar("shipping_method", { length: 100 }).notNull(),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  shippingLabel: json("shipping_label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type ShipmentInsert = typeof shipments.$inferInsert;