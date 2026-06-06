import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolsRouter from "./tools";
import guidesRouter from "./guides";
import hnRouter from "./hn";
import statsRouter from "./stats";
import newsletterRouter from "./newsletter";
import pushRouter from "./push";
import sitemapRouter from "./sitemap";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolsRouter);
router.use(guidesRouter);
router.use(hnRouter);
router.use(statsRouter);
router.use(newsletterRouter);
router.use(pushRouter);
router.use(sitemapRouter);

export default router;
