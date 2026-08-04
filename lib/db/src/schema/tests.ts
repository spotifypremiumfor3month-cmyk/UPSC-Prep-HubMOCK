import { pgTable, text, serial, integer, real, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const testsTable = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  duration: integer("duration").notNull(), // minutes
  totalMarks: integer("total_marks").notNull(),
  negativeMarks: real("negative_marks").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft, published, archived
  scheduledFor: date("scheduled_for", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTestSchema = createInsertSchema(testsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof testsTable.$inferSelect;
