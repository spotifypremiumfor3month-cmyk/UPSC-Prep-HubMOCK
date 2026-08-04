import { pgTable, serial, integer, real, text, timestamp } from "drizzle-orm/pg-core";
import { testsTable } from "./tests";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const attemptsTable = pgTable("attempts", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull().references(() => testsTable.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull().default("Anonymous"),
  score: real("score").notNull(),
  totalMarks: integer("total_marks").notNull(),
  percentage: real("percentage").notNull(),
  timeTaken: integer("time_taken").notNull(), // seconds
  correct: integer("correct").notNull(),
  incorrect: integer("incorrect").notNull(),
  skipped: integer("skipped").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttemptSchema = createInsertSchema(attemptsTable).omit({ id: true, submittedAt: true });
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attemptsTable.$inferSelect;
