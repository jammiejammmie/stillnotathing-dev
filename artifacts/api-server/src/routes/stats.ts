import { Router } from "express";
import { db } from "@workspace/db";
import { toolsTable, guidesTable, hnStoriesTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router = Router();

router.get("/stats/summary", async (req, res) => {
  try {
    const [toolStats] = await db
      .select({
        totalTools: sql<number>`count(*)::int`,
        avgHappinessScore: sql<number>`avg(happiness_score)::float`,
      })
      .from(toolsTable);

    const [guideStats] = await db
      .select({ totalGuides: sql<number>`count(*)::int` })
      .from(guidesTable);

    const [hnStats] = await db
      .select({ totalHnStories: sql<number>`count(*)::int` })
      .from(hnStoriesTable);

    const [topCategoryRow] = await db
      .select({
        category: toolsTable.category,
        count: sql<number>`count(*)::int`,
      })
      .from(toolsTable)
      .groupBy(toolsTable.category)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    res.json({
      totalTools: toolStats.totalTools,
      totalGuides: guideStats.totalGuides,
      totalHnStories: hnStats.totalHnStories,
      avgHappinessScore: Number((toolStats.avgHappinessScore || 0).toFixed(1)),
      topCategory: topCategoryRow?.category || "",
    });
  } catch (err) {
    req.log.error({ err }, "Error getting stats summary");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
