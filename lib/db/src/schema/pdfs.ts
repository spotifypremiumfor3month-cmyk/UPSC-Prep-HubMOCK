import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pdfsTable = pgTable("pdfs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  topic: text("topic"),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull().default(0), // bytes
  pageCount: integer("page_count"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPdfSchema = createInsertSchema(pdfsTable).omit({ id: true, uploadedAt: true });
export type InsertPdf = z.infer<typeof insertPdfSchema>;
export type Pdf = typeof pdfsTable.$inferSelect;
