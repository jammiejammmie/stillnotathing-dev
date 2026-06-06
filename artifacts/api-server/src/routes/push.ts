import { Router } from "express";
import { db } from "@workspace/db";
import { pushSubscriptions } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
const router = Router();

router.post("/push/subscribe", async (req, res) => {
  const body = req.body as { endpoint?: unknown };
  if (typeof body.endpoint !== "string" || !body.endpoint.startsWith("http")) {
    res.status(400).json({ error: "Invalid subscription object" });
    return;
  }

  try {
    const existing = await db
      .select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, body.endpoint))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(pushSubscriptions).values({
        endpoint: body.endpoint as string,
        subscription: req.body,
      });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Push subscribe error");
    res.status(500).json({ error: "Failed to store subscription" });
  }
});

router.post("/push/unsubscribe", async (req, res) => {
  const { endpoint } = req.body as { endpoint?: string };
  if (!endpoint) { res.status(400).json({ error: "endpoint required" }); return; }

  try {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Push unsubscribe error");
    res.status(500).json({ error: "Failed to remove subscription" });
  }
});

export default router;
