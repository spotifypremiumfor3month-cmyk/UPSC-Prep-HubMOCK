import { Router, type IRouter } from "express";
import { db, dailyPracticeTable, dailyPracticeQuestionsTable, questionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  ListDailyPracticeResponse,
  CreateDailyPracticeBody,
  CreateDailyPracticeResponse,
  GetTodayDailyPracticeResponse,
  GetDailyPracticeParams,
  GetDailyPracticeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/daily", async (_req, res): Promise<void> => {
  const sets = await db.select().from(dailyPracticeTable).orderBy(dailyPracticeTable.practiceDate);

  const withCounts = await Promise.all(
    sets.map(async (s) => {
      const [count] = await db
        .select({ count: sql<number>`count(*)` })
        .from(dailyPracticeQuestionsTable)
        .where(eq(dailyPracticeQuestionsTable.dailyPracticeId, s.id));
      return { ...s, questionCount: Number(count?.count ?? 0) };
    })
  );

  res.json(ListDailyPracticeResponse.parse(withCounts));
});

router.post("/daily", async (req, res): Promise<void> => {
  const parsed = CreateDailyPracticeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [dp] = await db.insert(dailyPracticeTable).values({
    title: parsed.data.title,
    practiceDate:
      parsed.data.practiceDate instanceof Date
        ? parsed.data.practiceDate.toISOString().slice(0, 10)
        : parsed.data.practiceDate,
    subject: parsed.data.subject,
  }).returning();

  if (parsed.data.questionIds.length > 0) {
    await db.insert(dailyPracticeQuestionsTable).values(
      parsed.data.questionIds.map((qId, idx) => ({
        dailyPracticeId: dp.id,
        questionId: qId,
        orderIndex: idx,
      }))
    );
  }

  res.status(201).json(CreateDailyPracticeResponse.parse({ ...dp, questionCount: parsed.data.questionIds.length }));
});

router.get("/daily/today", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const [dp] = await db.select().from(dailyPracticeTable).where(eq(dailyPracticeTable.practiceDate, today));
  if (!dp) {
    res.status(404).json({ error: "No practice set for today" });
    return;
  }

  const qRows = await db
    .select({ question: questionsTable })
    .from(dailyPracticeQuestionsTable)
    .innerJoin(questionsTable, eq(dailyPracticeQuestionsTable.questionId, questionsTable.id))
    .where(eq(dailyPracticeQuestionsTable.dailyPracticeId, dp.id))
    .orderBy(dailyPracticeQuestionsTable.orderIndex);

  const questions = qRows.map((r) => r.question);

  res.json(GetTodayDailyPracticeResponse.parse({ ...dp, questionCount: questions.length, questions }));
});

router.get("/daily/:id", async (req, res): Promise<void> => {
  const params = GetDailyPracticeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [dp] = await db.select().from(dailyPracticeTable).where(eq(dailyPracticeTable.id, params.data.id));
  if (!dp) {
    res.status(404).json({ error: "Daily practice not found" });
    return;
  }

  const qRows = await db
    .select({ question: questionsTable })
    .from(dailyPracticeQuestionsTable)
    .innerJoin(questionsTable, eq(dailyPracticeQuestionsTable.questionId, questionsTable.id))
    .where(eq(dailyPracticeQuestionsTable.dailyPracticeId, dp.id))
    .orderBy(dailyPracticeQuestionsTable.orderIndex);

  const questions = qRows.map((r) => r.question);

  res.json(GetDailyPracticeResponse.parse({ ...dp, questionCount: questions.length, questions }));
});

export default router;
