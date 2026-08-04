import { Router, type IRouter } from "express";
import { db, attemptsTable, attemptAnswersTable, testsTable, questionsTable, testQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListAttemptsResponse,
  CreateAttemptBody,
  CreateAttemptResponse,
  GetAttemptParams,
  GetAttemptResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/attempts", async (_req, res): Promise<void> => {
  const attempts = await db
    .select({
      id: attemptsTable.id,
      testId: attemptsTable.testId,
      testTitle: testsTable.title,
      score: attemptsTable.score,
      totalMarks: attemptsTable.totalMarks,
      percentage: attemptsTable.percentage,
      timeTaken: attemptsTable.timeTaken,
      submittedAt: attemptsTable.submittedAt,
    })
    .from(attemptsTable)
    .innerJoin(testsTable, eq(attemptsTable.testId, testsTable.id))
    .orderBy(attemptsTable.submittedAt);

  res.json(ListAttemptsResponse.parse(attempts));
});

router.post("/attempts", async (req, res): Promise<void> => {
  const parsed = CreateAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [test] = await db.select().from(testsTable).where(eq(testsTable.id, parsed.data.testId));
  if (!test) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  // Load the test questions to grade
  const tqs = await db
    .select({ question: questionsTable })
    .from(testQuestionsTable)
    .innerJoin(questionsTable, eq(testQuestionsTable.questionId, questionsTable.id))
    .where(eq(testQuestionsTable.testId, test.id));

  const questionMap = new Map(tqs.map((r) => [r.question.id, r.question]));

  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  let score = 0;

  const answerDetails = parsed.data.answers.map((a) => {
    const q = questionMap.get(a.questionId);
    if (!q) return null;

    if (!a.selectedOption) {
      skipped++;
      return { questionId: a.questionId, selectedOption: null, isCorrect: false };
    }

    const isCorrect = a.selectedOption === q.correctOption;
    if (isCorrect) {
      correct++;
      score += test.totalMarks / tqs.length;
    } else {
      incorrect++;
      score -= test.negativeMarks;
    }

    return { questionId: a.questionId, selectedOption: a.selectedOption, isCorrect };
  }).filter(Boolean) as { questionId: number; selectedOption: string | null; isCorrect: boolean }[];

  score = Math.max(0, score);
  const percentage = test.totalMarks > 0 ? (score / test.totalMarks) * 100 : 0;

  const [attempt] = await db.insert(attemptsTable).values({
    testId: test.id,
    studentName: "Aspirant",
    score,
    totalMarks: test.totalMarks,
    percentage,
    timeTaken: parsed.data.timeTaken,
    correct,
    incorrect,
    skipped,
  }).returning();

  if (answerDetails.length > 0) {
    await db.insert(attemptAnswersTable).values(
      answerDetails.map((a) => ({
        attemptId: attempt.id,
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
      }))
    );
  }

  // Build detailed result
  const answers = answerDetails.map((a) => {
    const q = questionMap.get(a.questionId)!;
    return {
      questionId: q.id,
      questionText: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      selectedOption: a.selectedOption,
      correctOption: q.correctOption,
      isCorrect: a.isCorrect,
      explanation: q.explanation,
    };
  });

  res.status(201).json(CreateAttemptResponse.parse({
    id: attempt.id,
    testId: test.id,
    testTitle: test.title,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    percentage: attempt.percentage,
    timeTaken: attempt.timeTaken,
    correct,
    incorrect,
    skipped,
    submittedAt: attempt.submittedAt,
    answers,
  }));
});

router.get("/attempts/:id", async (req, res): Promise<void> => {
  const params = GetAttemptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [attempt] = await db
    .select({
      id: attemptsTable.id,
      testId: attemptsTable.testId,
      testTitle: testsTable.title,
      score: attemptsTable.score,
      totalMarks: attemptsTable.totalMarks,
      percentage: attemptsTable.percentage,
      timeTaken: attemptsTable.timeTaken,
      correct: attemptsTable.correct,
      incorrect: attemptsTable.incorrect,
      skipped: attemptsTable.skipped,
      submittedAt: attemptsTable.submittedAt,
    })
    .from(attemptsTable)
    .innerJoin(testsTable, eq(attemptsTable.testId, testsTable.id))
    .where(eq(attemptsTable.id, params.data.id));

  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  const answerRows = await db
    .select({
      aa: attemptAnswersTable,
      q: questionsTable,
    })
    .from(attemptAnswersTable)
    .innerJoin(questionsTable, eq(attemptAnswersTable.questionId, questionsTable.id))
    .where(eq(attemptAnswersTable.attemptId, params.data.id));

  const answers = answerRows.map(({ aa, q }) => ({
    questionId: q.id,
    questionText: q.text,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    selectedOption: aa.selectedOption,
    correctOption: q.correctOption,
    isCorrect: aa.isCorrect,
    explanation: q.explanation,
  }));

  res.json(GetAttemptResponse.parse({ ...attempt, answers }));
});

export default router;
