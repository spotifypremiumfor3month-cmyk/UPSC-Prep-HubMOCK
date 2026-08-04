import { Router, type IRouter } from "express";
import { db, testsTable, testQuestionsTable, questionsTable } from "@workspace/db";
import { eq, and, SQL, sql } from "drizzle-orm";
import {
  ListTestsQueryParams,
  ListTestsResponse,
  CreateTestBody,
  CreateTestResponse,
  GetTestParams,
  GetTestResponse,
  UpdateTestParams,
  UpdateTestBody,
  UpdateTestResponse,
  DeleteTestParams,
  AddQuestionsToTestParams,
  AddQuestionsToTestBody,
  AddQuestionsToTestResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getTestWithCounts(id: number) {
  const [test] = await db.select().from(testsTable).where(eq(testsTable.id, id));
  if (!test) return null;

  const [qCount, aCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(testQuestionsTable).where(eq(testQuestionsTable.testId, id)),
    db.select({ count: sql<number>`count(*)` }).from(
      // We don't have an attempts table imported yet; use raw SQL
      sql`(SELECT id FROM attempts WHERE test_id = ${id}) AS a`
    ),
  ]);

  return {
    ...test,
    questionCount: Number(qCount[0]?.count ?? 0),
    attemptCount: Number(aCount[0]?.count ?? 0),
  };
}

router.get("/tests", async (req, res): Promise<void> => {
  const query = ListTestsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions: SQL[] = [];
  if (query.data.subject) conditions.push(eq(testsTable.subject, query.data.subject));
  if (query.data.status) conditions.push(eq(testsTable.status, query.data.status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const tests = await db.select().from(testsTable).where(where).orderBy(testsTable.createdAt);

  const testsWithCounts = await Promise.all(
    tests.map(async (test) => {
      const [qCount, aCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(testQuestionsTable).where(eq(testQuestionsTable.testId, test.id)),
        db.select({ count: sql<number>`count(*)` }).from(sql`(SELECT id FROM attempts WHERE test_id = ${test.id}) AS a`),
      ]);
      return {
        ...test,
        questionCount: Number(qCount[0]?.count ?? 0),
        attemptCount: Number(aCount[0]?.count ?? 0),
      };
    })
  );

  res.json(ListTestsResponse.parse(testsWithCounts));
});

router.post("/tests", async (req, res): Promise<void> => {
  const parsed = CreateTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [test] = await db.insert(testsTable).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    subject: parsed.data.subject,
    duration: parsed.data.duration,
    totalMarks: parsed.data.totalMarks,
    negativeMarks: parsed.data.negativeMarks ?? 0,
    status: parsed.data.status ?? "draft",
    scheduledFor: parsed.data.scheduledFor ?? null,
  }).returning();

  res.status(201).json(CreateTestResponse.parse({ ...test, questionCount: 0, attemptCount: 0 }));
});

router.get("/tests/:id", async (req, res): Promise<void> => {
  const params = GetTestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const test = await getTestWithCounts(params.data.id);
  if (!test) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  // Fetch questions for this test
  const tqs = await db
    .select({ question: questionsTable })
    .from(testQuestionsTable)
    .innerJoin(questionsTable, eq(testQuestionsTable.questionId, questionsTable.id))
    .where(eq(testQuestionsTable.testId, params.data.id))
    .orderBy(testQuestionsTable.orderIndex);

  const questions = tqs.map((r) => r.question);

  res.json(GetTestResponse.parse({ ...test, questions }));
});

router.patch("/tests/:id", async (req, res): Promise<void> => {
  const params = UpdateTestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.subject !== undefined) updateData.subject = parsed.data.subject;
  if (parsed.data.duration !== undefined) updateData.duration = parsed.data.duration;
  if (parsed.data.totalMarks !== undefined) updateData.totalMarks = parsed.data.totalMarks;
  if (parsed.data.negativeMarks !== undefined) updateData.negativeMarks = parsed.data.negativeMarks;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.scheduledFor !== undefined) updateData.scheduledFor = parsed.data.scheduledFor;

  const [updated] = await db.update(testsTable).set(updateData).where(eq(testsTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  const withCounts = await getTestWithCounts(updated.id);
  res.json(UpdateTestResponse.parse(withCounts));
});

router.delete("/tests/:id", async (req, res): Promise<void> => {
  const params = DeleteTestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(testsTable).where(eq(testsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/tests/:id/questions", async (req, res): Promise<void> => {
  const params = AddQuestionsToTestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddQuestionsToTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const test = await db.select().from(testsTable).where(eq(testsTable.id, params.data.id));
  if (!test[0]) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  // Remove existing questions and re-insert
  await db.delete(testQuestionsTable).where(eq(testQuestionsTable.testId, params.data.id));

  if (parsed.data.questionIds.length > 0) {
    await db.insert(testQuestionsTable).values(
      parsed.data.questionIds.map((qId, idx) => ({
        testId: params.data.id,
        questionId: qId,
        orderIndex: idx,
      }))
    );
  }

  const withCounts = await getTestWithCounts(params.data.id);
  res.json(AddQuestionsToTestResponse.parse(withCounts));
});

export default router;
