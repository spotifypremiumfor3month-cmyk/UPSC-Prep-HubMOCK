import { Router, type IRouter } from "express";
import { db, questionsTable } from "@workspace/db";
import { eq, and, SQL, sql } from "drizzle-orm";
import {
  ListQuestionsQueryParams,
  ListQuestionsResponse,
  CreateQuestionBody,
  CreateQuestionResponse,
  BulkCreateQuestionsBody,
  BulkCreateQuestionsResponse,
  GetQuestionParams,
  GetQuestionResponse,
  UpdateQuestionParams,
  UpdateQuestionBody,
  UpdateQuestionResponse,
  DeleteQuestionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/questions", async (req, res): Promise<void> => {
  const query = ListQuestionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { subject, topic, difficulty, limit = 50, offset = 0 } = query.data;

  const conditions: SQL[] = [];
  if (subject) conditions.push(eq(questionsTable.subject, subject));
  if (topic) conditions.push(eq(questionsTable.topic, topic));
  if (difficulty) conditions.push(eq(questionsTable.difficulty, difficulty));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [questions, countResult] = await Promise.all([
    db.select().from(questionsTable).where(where).limit(limit).offset(offset).orderBy(questionsTable.createdAt),
    db.select({ count: sql<number>`count(*)` }).from(questionsTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json(ListQuestionsResponse.parse({ questions, total }));
});

router.post("/questions", async (req, res): Promise<void> => {
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [question] = await db.insert(questionsTable).values({
    text: parsed.data.text,
    optionA: parsed.data.optionA,
    optionB: parsed.data.optionB,
    optionC: parsed.data.optionC,
    optionD: parsed.data.optionD,
    correctOption: parsed.data.correctOption,
    explanation: parsed.data.explanation ?? null,
    subject: parsed.data.subject,
    topic: parsed.data.topic ?? null,
    difficulty: parsed.data.difficulty ?? "medium",
    year: parsed.data.year ?? null,
  }).returning();

  res.status(201).json(CreateQuestionResponse.parse(question));
});

router.post("/questions/bulk", async (req, res): Promise<void> => {
  const parsed = BulkCreateQuestionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let created = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const q of parsed.data.questions) {
    try {
      await db.insert(questionsTable).values({
        text: q.text,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        explanation: q.explanation ?? null,
        subject: q.subject,
        topic: q.topic ?? null,
        difficulty: q.difficulty ?? "medium",
        year: q.year ?? null,
      });
      created++;
    } catch (err) {
      failed++;
      errors.push(`Row ${created + failed}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  res.status(201).json(BulkCreateQuestionsResponse.parse({ created, failed, errors }));
});

router.get("/questions/:id", async (req, res): Promise<void> => {
  const params = GetQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, params.data.id));
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.json(GetQuestionResponse.parse(question));
});

router.patch("/questions/:id", async (req, res): Promise<void> => {
  const params = UpdateQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.text !== undefined) updateData.text = parsed.data.text;
  if (parsed.data.optionA !== undefined) updateData.optionA = parsed.data.optionA;
  if (parsed.data.optionB !== undefined) updateData.optionB = parsed.data.optionB;
  if (parsed.data.optionC !== undefined) updateData.optionC = parsed.data.optionC;
  if (parsed.data.optionD !== undefined) updateData.optionD = parsed.data.optionD;
  if (parsed.data.correctOption !== undefined) updateData.correctOption = parsed.data.correctOption;
  if (parsed.data.explanation !== undefined) updateData.explanation = parsed.data.explanation;
  if (parsed.data.subject !== undefined) updateData.subject = parsed.data.subject;
  if (parsed.data.topic !== undefined) updateData.topic = parsed.data.topic;
  if (parsed.data.difficulty !== undefined) updateData.difficulty = parsed.data.difficulty;
  if (parsed.data.year !== undefined) updateData.year = parsed.data.year;

  const [updated] = await db.update(questionsTable).set(updateData).where(eq(questionsTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.json(UpdateQuestionResponse.parse(updated));
});

router.delete("/questions/:id", async (req, res): Promise<void> => {
  const params = DeleteQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(questionsTable).where(eq(questionsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
