import { Router, type IRouter } from "express";
import { db, pdfsTable } from "@workspace/db";
import { eq, SQL } from "drizzle-orm";
import {
  ListPdfsQueryParams,
  ListPdfsResponse,
  CreatePdfBody,
  CreatePdfResponse,
  GetPdfParams,
  GetPdfResponse,
  DeletePdfParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/pdfs", async (req, res): Promise<void> => {
  const query = ListPdfsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions: SQL[] = [];
  if (query.data.subject) conditions.push(eq(pdfsTable.subject, query.data.subject));

  const where = conditions.length > 0 ? conditions[0] : undefined;
  const pdfs = await db.select().from(pdfsTable).where(where).orderBy(pdfsTable.uploadedAt);

  res.json(ListPdfsResponse.parse(pdfs));
});

router.post("/pdfs", async (req, res): Promise<void> => {
  const parsed = CreatePdfBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [pdf] = await db.insert(pdfsTable).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    subject: parsed.data.subject,
    topic: parsed.data.topic ?? null,
    fileUrl: parsed.data.fileUrl,
    fileSize: parsed.data.fileSize,
    pageCount: parsed.data.pageCount ?? null,
  }).returning();

  res.status(201).json(CreatePdfResponse.parse(pdf));
});

router.get("/pdfs/:id", async (req, res): Promise<void> => {
  const params = GetPdfParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pdf] = await db.select().from(pdfsTable).where(eq(pdfsTable.id, params.data.id));
  if (!pdf) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }

  res.json(GetPdfResponse.parse(pdf));
});

router.delete("/pdfs/:id", async (req, res): Promise<void> => {
  const params = DeletePdfParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(pdfsTable).where(eq(pdfsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
