import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { dailyPracticeTable } from "./daily-practice";
import { questionsTable } from "./questions";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyPracticeQuestionsTable = pgTable("daily_practice_questions", {
  id: serial("id").primaryKey(),
  dailyPracticeId: integer("daily_practice_id").notNull().references(() => dailyPracticeTable.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questionsTable.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDailyPracticeQuestionSchema = createInsertSchema(dailyPracticeQuestionsTable).omit({ id: true, createdAt: true });
export type InsertDailyPracticeQuestion = z.infer<typeof insertDailyPracticeQuestionSchema>;
export type DailyPracticeQuestion = typeof dailyPracticeQuestionsTable.$inferSelect;
