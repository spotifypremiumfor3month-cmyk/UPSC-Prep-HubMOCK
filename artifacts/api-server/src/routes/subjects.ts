import { Router, type IRouter } from "express";
import { db, subjectsTable } from "@workspace/db";
import { ListSubjectsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/subjects", async (req, res): Promise<void> => {
  const subjects = await db.select().from(subjectsTable).orderBy(subjectsTable.name);

  // Enrich with question counts via a subquery
  const { questionsTable } = await import("@workspace/db");
  const { sql } = await import("drizzle-orm");

  const withCounts = await db
    .select({
      id: subjectsTable.id,
      name: subjectsTable.name,
      code: subjectsTable.code,
      description: subjectsTable.description,
      createdAt: subjectsTable.createdAt,
      questionCount: sql<number>`(SELECT COUNT(*) FROM questions WHERE questions.subject = ${subjectsTable.name})`.as("question_count"),
    })
    .from(subjectsTable)
    .orderBy(subjectsTable.name);

  res.json(ListSubjectsResponse.parse(withCounts));
});

export default router;
