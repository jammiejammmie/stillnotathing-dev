import { pgTable, text, serial, real, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const toolsTable = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  tagline: text("tagline").notNull(),
  website: text("website").notNull(),
  logoUrl: text("logo_url"),
  dxScore: real("dx_score").notNull().default(0),
  priceScore: real("price_score").notNull().default(0),
  rageIndex: real("rage_index").notNull().default(0),
  happinessScore: real("happiness_score").notNull().default(0),
  voteCount: integer("vote_count").notNull().default(0),
  description: text("description"),
  pros: text("pros"),
  cons: text("cons"),
  pricingTier: text("pricing_tier").notNull().default("freemium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertToolSchema = createInsertSchema(toolsTable).omit({ id: true, createdAt: true });
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof toolsTable.$inferSelect;
