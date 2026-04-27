import { sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const bookingsTable = pgTable("bookings_v2", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  blockNumber: text("block_number").notNull(),
  buildingNumber: text("building_number").notNull(),
  apartmentNumber: text("apartment_number").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  services: text("services")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  totalPrice: integer("total_price").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Booking = typeof bookingsTable.$inferSelect;
export type InsertBooking = typeof bookingsTable.$inferInsert;
