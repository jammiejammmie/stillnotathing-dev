import { Router } from "express";
import { db } from "@workspace/db";
import { toolsTable } from "@workspace/db";
import { eq, desc, asc, sql } from "drizzle-orm";
import {
  ListToolsQueryParams,
  CreateToolBody,
  GetToolParams,
  VoteOnToolParams,
  VoteOnToolBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/tools", async (req, res) => {
  try {
    const query = ListToolsQueryParams.parse(req.query);
    let tools = db.select().from(toolsTable);

    const conditions: ReturnType<typeof eq>[] = [];
    if (query.category) {
      conditions.push(eq(toolsTable.category, query.category));
    }

    let result;
    if (conditions.length > 0) {
      result = await db
        .select()
        .from(toolsTable)
        .where(conditions[0])
        .orderBy(desc(toolsTable.happinessScore));
    } else {
      result = await db
        .select()
        .from(toolsTable)
        .orderBy(desc(toolsTable.happinessScore));
    }

    if (query.sort === "dx") {
      result = result.sort((a, b) => b.dxScore - a.dxScore);
    } else if (query.sort === "price") {
      result = result.sort((a, b) => b.priceScore - a.priceScore);
    } else if (query.sort === "rage") {
      result = result.sort((a, b) => a.rageIndex - b.rageIndex);
    } else if (query.sort === "happiness") {
      result = result.sort((a, b) => b.happinessScore - a.happinessScore);
    }

    const serialized = result.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    }));
    res.json(serialized);
  } catch (err) {
    req.log.error({ err }, "Error listing tools");
    res.status(500).json({ error: "Failed to list tools" });
  }
});

router.post("/tools", async (req, res) => {
  try {
    const body = CreateToolBody.parse(req.body);
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const [tool] = await db
      .insert(toolsTable)
      .values({ ...body, slug })
      .returning();
    res.status(201).json({ ...tool, createdAt: tool.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating tool");
    res.status(500).json({ error: "Failed to create tool" });
  }
});

router.get("/tools/top", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(toolsTable)
      .orderBy(desc(toolsTable.happinessScore))
      .limit(6);
    res.json(result.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Error getting top tools");
    res.status(500).json({ error: "Failed to get top tools" });
  }
});

router.get("/tools/categories", async (req, res) => {
  try {
    const result = await db
      .select({
        category: toolsTable.category,
        count: sql<number>`count(*)::int`,
      })
      .from(toolsTable)
      .groupBy(toolsTable.category)
      .orderBy(desc(sql`count(*)`));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error getting tool categories");
    res.status(500).json({ error: "Failed to get categories" });
  }
});

router.get("/tools/:id", async (req, res) => {
  try {
    const params = GetToolParams.parse({ id: Number(req.params.id) });
    const [tool] = await db
      .select()
      .from(toolsTable)
      .where(eq(toolsTable.id, params.id));
    if (!tool) return res.status(404).json({ error: "Tool not found" });
    res.json({ ...tool, createdAt: tool.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error getting tool");
    res.status(500).json({ error: "Failed to get tool" });
  }
});

router.post("/votes/tool/:toolId", async (req, res) => {
  try {
    const params = VoteOnToolParams.parse({ toolId: Number(req.params.toolId) });
    const body = VoteOnToolBody.parse(req.body);
    const delta = body.type === "up" ? 1 : -1;
    const [updated] = await db
      .update(toolsTable)
      .set({ voteCount: sql`${toolsTable.voteCount} + ${delta}` })
      .where(eq(toolsTable.id, params.toolId))
      .returning({ voteCount: toolsTable.voteCount });
    if (!updated) return res.status(404).json({ error: "Tool not found" });
    res.json({ success: true, voteCount: updated.voteCount });
  } catch (err) {
    req.log.error({ err }, "Error voting on tool");
    res.status(500).json({ error: "Failed to vote" });
  }
});

export default router;
