import { Router, type IRouter } from "express";
import { db, questionsTable, testsTable, pdfsTable, attemptsTable, subjectsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import {
  GetDashboardStatsResponse,
  GetRecentActivityResponse,
  GetSubjectStatsResponse,
  GetLeaderboardResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    [{ totalQuestions }],
    [{ totalTests }],
    [{ totalPdfs }],
    [{ totalAttempts }],
    avgResult,
    [{ todayCount }],
    [{ questionsThisWeek }],
    [{ testsPublished }],
  ] = await Promise.all([
    db.select({ totalQuestions: sql<number>`count(*)` }).from(questionsTable),
    db.select({ totalTests: sql<number>`count(*)` }).from(testsTable),
    db.select({ totalPdfs: sql<number>`count(*)` }).from(pdfsTable),
    db.select({ totalAttempts: sql<number>`count(*)` }).from(attemptsTable),
    db.select({ avg: sql<number>`coalesce(avg(percentage), 0)` }).from(attemptsTable),
    db.select({ todayCount: sql<number>`count(*)` }).from(
      sql`(SELECT id FROM daily_practice WHERE practice_date = ${today}) AS t`
    ),
    db.select({ questionsThisWeek: sql<number>`count(*)` }).from(questionsTable).where(
      sql`created_at >= ${weekAgo}`
    ),
    db.select({ testsPublished: sql<number>`count(*)` }).from(testsTable).where(eq(testsTable.status, "published")),
  ]);

  res.json(GetDashboardStatsResponse.parse({
    totalQuestions: Number(totalQuestions),
    totalTests: Number(totalTests),
    totalPdfs: Number(totalPdfs),
    totalAttempts: Number(totalAttempts),
    averageScore: Number(avgResult[0]?.avg ?? 0),
    todayHasPractice: Number(todayCount) > 0,
    questionsThisWeek: Number(questionsThisWeek),
    testsPublished: Number(testsPublished),
  }));
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  // Fetch recent items from multiple tables and merge
  const [recentQuestions, recentTests, recentPdfs, recentAttempts] = await Promise.all([
    db.select().from(questionsTable).orderBy(desc(questionsTable.createdAt)).limit(3),
    db.select().from(testsTable).orderBy(desc(testsTable.createdAt)).limit(3),
    db.select().from(pdfsTable).orderBy(desc(pdfsTable.uploadedAt)).limit(3),
    db.select({
      id: attemptsTable.id,
      testTitle: testsTable.title,
      percentage: attemptsTable.percentage,
      submittedAt: attemptsTable.submittedAt,
    }).from(attemptsTable).innerJoin(testsTable, eq(attemptsTable.testId, testsTable.id)).orderBy(desc(attemptsTable.submittedAt)).limit(3),
  ]);

  const activities = [
    ...recentQuestions.map((q) => ({
      id: q.id,
      type: "question_added" as const,
      title: "New Question Added",
      description: `${q.subject}: ${q.text.slice(0, 60)}...`,
      createdAt: q.createdAt,
    })),
    ...recentTests.map((t) => ({
      id: t.id,
      type: "test_created" as const,
      title: "Test Series Created",
      description: `${t.title} — ${t.subject}`,
      createdAt: t.createdAt,
    })),
    ...recentPdfs.map((p) => ({
      id: p.id,
      type: "pdf_uploaded" as const,
      title: "PDF Study Material Uploaded",
      description: `${p.title} — ${p.subject}`,
      createdAt: p.uploadedAt,
    })),
    ...recentAttempts.map((a) => ({
      id: a.id,
      type: "attempt_submitted" as const,
      title: "Test Attempted",
      description: `${a.testTitle} — Score: ${a.percentage.toFixed(1)}%`,
      createdAt: a.submittedAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  res.json(GetRecentActivityResponse.parse(activities));
});

router.get("/dashboard/subject-stats", async (_req, res): Promise<void> => {
  const subjects = await db.select().from(subjectsTable);

  const stats = await Promise.all(
    subjects.map(async (s) => {
      const [qCount, tCount, pCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(questionsTable).where(eq(questionsTable.subject, s.name)),
        db.select({ count: sql<number>`count(*)` }).from(testsTable).where(eq(testsTable.subject, s.name)),
        db.select({ count: sql<number>`count(*)` }).from(pdfsTable).where(eq(pdfsTable.subject, s.name)),
      ]);
      return {
        subject: s.name,
        questionCount: Number(qCount[0]?.count ?? 0),
        testCount: Number(tCount[0]?.count ?? 0),
        pdfCount: Number(pCount[0]?.count ?? 0),
      };
    })
  );

  res.json(GetSubjectStatsResponse.parse(stats));
});

router.get("/dashboard/leaderboard", async (_req, res): Promise<void> => {
  // Group by studentName, compute stats
  const rows = await db.execute(sql`
    SELECT
      student_name AS name,
      COUNT(*) AS total_attempts,
      ROUND(AVG(percentage)::numeric, 2) AS average_score,
      ROUND(MAX(percentage)::numeric, 2) AS best_score
    FROM attempts
    GROUP BY student_name
    ORDER BY average_score DESC
    LIMIT 20
  `);

  const entries = (rows.rows as Array<{
    name: string;
    total_attempts: string;
    average_score: string;
    best_score: string;
  }>).map((r, i) => ({
    rank: i + 1,
    name: r.name,
    totalAttempts: Number(r.total_attempts),
    averageScore: Number(r.average_score),
    bestScore: Number(r.best_score),
  }));

  res.json(GetLeaderboardResponse.parse(entries));
});

export default router;
