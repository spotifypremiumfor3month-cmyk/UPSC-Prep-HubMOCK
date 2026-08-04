import { pgTable, serial, integer, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { attemptsTable } from "./attempts";
import { questionsTable } from "./questions";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const attemptAnswersTable = pgTable("attempt_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull().references(() => attemptsTable.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questionsTable.id, { onDelete: "cascade" }),
  selectedOption: text("selected_option"), // A, B, C, D, or null (skipped)
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttemptAnswerSchema = createInsertSchema(attemptAnswersTable).omit({ id: true, createdAt: true });
export type InsertAttemptAnswer = z.infer<typeof insertAttemptAnswerSchema>;
export type AttemptAnswer = typeof attemptAnswersTable.$inferSelect;
