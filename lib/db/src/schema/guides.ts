import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const guidesTable = pgTable("guides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull().default("guide"),
  excerpt: text("excerpt").notNull(),
  content: text("content"),
  tags: text("tags"),
  readingTime: integer("reading_time").notNull().default(5),
  isFeatured: boolean("is_featured").notNull().default(false),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  author: text("author"),
});

export const insertGuideSchema = createInsertSchema(guidesTable).omit({ id: true });
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Guide = typeof guidesTable.$inferSelect;
