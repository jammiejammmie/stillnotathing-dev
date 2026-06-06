import { Router } from "express";
import { db } from "@workspace/db";
import { toolsTable, guidesTable } from "@workspace/db/schema";

const router = Router();

const SITE_URL = process.env.REPLIT_DOMAINS
  ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
  : "https://astro.replit.app";

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function url(loc: string, priority = "0.8", changefreq = "weekly") {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

router.get("/sitemap.xml", async (req, res) => {
  try {
    const [allTools, allGuides] = await Promise.all([
      db.select({ id: toolsTable.id }).from(toolsTable),
      db.select({ id: guidesTable.id }).from(guidesTable),
    ]);

    const staticUrls = [
      url(`${SITE_URL}/`, "1.0", "daily"),
      url(`${SITE_URL}/tools`, "0.9", "daily"),
      url(`${SITE_URL}/guides`, "0.9", "daily"),
      url(`${SITE_URL}/hn`, "0.8", "daily"),
    ];

    const toolUrls = allTools.map((t) => url(`${SITE_URL}/tools/${t.id}`, "0.7"));
    const guideUrls = allGuides.map((g) => url(`${SITE_URL}/guides/${g.id}`, "0.7"));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...toolUrls, ...guideUrls].join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    req.log.error({ err }, "Sitemap generation error");
    res.status(500).send("Failed to generate sitemap");
  }
});

export default router;
