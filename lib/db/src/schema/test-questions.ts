import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { testsTable } from "./tests";
import { questionsTable } from "./questions";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const testQuestionsTable = pgTable("test_questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull().references(() => testsTable.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questionsTable.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestQuestionSchema = createInsertSchema(testQuestionsTable).omit({ id: true, createdAt: true });
export type InsertTestQuestion = z.infer<typeof insertTestQuestionSchema>;
export type TestQuestion = typeof testQuestionsTable.$inferSelect;
