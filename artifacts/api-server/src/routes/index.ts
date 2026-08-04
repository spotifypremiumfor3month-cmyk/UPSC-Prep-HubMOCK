import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import subjectsRouter from "./subjects";
import questionsRouter from "./questions";
import testsRouter from "./tests";
import attemptsRouter from "./attempts";
import pdfsRouter from "./pdfs";
import dailyRouter from "./daily";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(subjectsRouter);
router.use(questionsRouter);
router.use(testsRouter);
router.use(attemptsRouter);
router.use(pdfsRouter);
router.use(dailyRouter);
router.use(dashboardRouter);

export default router;
