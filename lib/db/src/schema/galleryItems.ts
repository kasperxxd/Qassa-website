import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const galleryItemsTable = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  section: varchar("section", { length: 20 }).notNull(),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  styleType: text("style_type"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type GalleryItem = typeof galleryItemsTable.$inferSelect;
export type InsertGalleryItem = typeof galleryItemsTable.$inferInsert;
