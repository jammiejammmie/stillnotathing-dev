import { Router } from "express";
import { db } from "@workspace/db";
import { hnStoriesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { GetHnCuratedQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/hn/curated", async (req, res) => {
  try {
    const query = GetHnCuratedQueryParams.parse(req.query);
    const limit = query.limit || 20;
    const result = await db
      .select()
      .from(hnStoriesTable)
      .orderBy(desc(hnStoriesTable.curatedAt))
      .limit(limit);
    res.json(
      result.map((s) => ({
        ...s,
        postedAt: s.postedAt.toISOString(),
        curatedAt: s.curatedAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error getting HN curated");
    res.status(500).json({ error: "Failed to get HN stories" });
  }
});

export default router;
