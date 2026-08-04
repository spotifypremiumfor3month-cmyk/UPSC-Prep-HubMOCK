import { pgTable, text, serial, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyPracticeTable = pgTable("daily_practice", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  practiceDate: date("practice_date", { mode: "string" }).notNull().unique(),
  subject: text("subject").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDailyPracticeSchema = createInsertSchema(dailyPracticeTable).omit({ id: true, createdAt: true });
export type InsertDailyPractice = z.infer<typeof insertDailyPracticeSchema>;
export type DailyPractice = typeof dailyPracticeTable.$inferSelect;
