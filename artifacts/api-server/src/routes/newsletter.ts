import { Router } from "express";
import { db } from "@workspace/db";
import { emailSubscribers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
const router = Router();

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/newsletter/subscribe", async (req, res) => {
  const { email } = req.body as { email?: unknown };
  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(emailSubscribers)
      .where(eq(emailSubscribers.email, email))
      .limit(1);

    if (existing.length > 0) {
      if (!existing[0].active) {
        await db
          .update(emailSubscribers)
          .set({ active: true })
          .where(eq(emailSubscribers.email, email));
      }
      res.json({ success: true, message: "Already subscribed" });
      return;
    }

    await db.insert(emailSubscribers).values({ email });

    // TODO: When RESEND_API_KEY is set, send confirmation email here

    res.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    req.log.error({ err }, "Newsletter subscribe error");
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

export default router;
