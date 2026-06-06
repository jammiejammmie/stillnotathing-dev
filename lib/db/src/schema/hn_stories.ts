import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hnStoriesTable = pgTable("hn_stories", {
  id: serial("id").primaryKey(),
  hnId: integer("hn_id"),
  title: text("title").notNull(),
  url: text("url").notNull(),
  domain: text("domain"),
  score: integer("score").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  author: text("author"),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
  curatedAt: timestamp("curated_at").notNull().defaultNow(),
  curatorNote: text("curator_note"),
  tag: text("tag"),
});

export const insertHnStorySchema = createInsertSchema(hnStoriesTable).omit({ id: true });
export type InsertHnStory = z.infer<typeof insertHnStorySchema>;
export type HnStory = typeof hnStoriesTable.$inferSelect;
