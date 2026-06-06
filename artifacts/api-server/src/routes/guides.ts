import { Router } from "express";
import { db } from "@workspace/db";
import { guidesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListGuidesQueryParams,
  CreateGuideBody,
  GetGuideParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/guides", async (req, res) => {
  try {
    const query = ListGuidesQueryParams.parse(req.query);
    let result;
    if (query.type) {
      result = await db
        .select()
        .from(guidesTable)
        .where(eq(guidesTable.type, query.type))
        .orderBy(desc(guidesTable.publishedAt));
    } else {
      result = await db
        .select()
        .from(guidesTable)
        .orderBy(desc(guidesTable.publishedAt));
    }

    if (query.tag) {
      result = result.filter((g) => g.tags?.includes(query.tag!));
    }

    res.json(result.map((g) => ({ ...g, publishedAt: g.publishedAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Error listing guides");
    res.status(500).json({ error: "Failed to list guides" });
  }
});

router.post("/guides", async (req, res) => {
  try {
    const body = CreateGuideBody.parse(req.body);
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const [guide] = await db
      .insert(guidesTable)
      .values({ ...body, slug })
      .returning();
    res.status(201).json({ ...guide, publishedAt: guide.publishedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating guide");
    res.status(500).json({ error: "Failed to create guide" });
  }
});

router.get("/guides/daily", async (req, res) => {
  try {
    const [guide] = await db
      .select()
      .from(guidesTable)
      .where(eq(guidesTable.isFeatured, true))
      .orderBy(desc(guidesTable.publishedAt))
      .limit(1);
    if (!guide) {
      const [fallback] = await db
        .select()
        .from(guidesTable)
        .orderBy(desc(guidesTable.publishedAt))
        .limit(1);
      if (!fallback) return res.status(404).json({ error: "No guides found" });
      return res.json({ ...fallback, publishedAt: fallback.publishedAt.toISOString() });
    }
    res.json({ ...guide, publishedAt: guide.publishedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error getting daily guide");
    res.status(500).json({ error: "Failed to get daily guide" });
  }
});

router.get("/guides/:id", async (req, res) => {
  try {
    const params = GetGuideParams.parse({ id: Number(req.params.id) });
    const [guide] = await db
      .select()
      .from(guidesTable)
      .where(eq(guidesTable.id, params.id));
    if (!guide) return res.status(404).json({ error: "Guide not found" });
    res.json({ ...guide, publishedAt: guide.publishedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error getting guide");
    res.status(500).json({ error: "Failed to get guide" });
  }
});

export default router;
