import { Router, type IRouter, type Request, type Response } from "express";
import { db, galleryItemsTable } from "@workspace/db";
import {
  CreateGalleryItemBodySchema,
  DeleteGalleryItemParams,
  ListGalleryItemsQueryParams,
} from "@workspace/api-zod";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

function serialize(g: typeof galleryItemsTable.$inferSelect) {
  return {
    id: g.id,
    section: g.section,
    imageUrl: g.imageUrl,
    title: g.title,
    styleType: g.styleType,
    createdAt: g.createdAt.toISOString(),
  };
}

router.get("/gallery", async (req: Request, res: Response): Promise<void> => {
  const parsed = ListGalleryItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const section = parsed.data?.section;
  const rows = section
    ? await db
        .select()
        .from(galleryItemsTable)
        .where(eq(galleryItemsTable.section, section))
        .orderBy(desc(galleryItemsTable.createdAt))
    : await db
        .select()
        .from(galleryItemsTable)
        .orderBy(desc(galleryItemsTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/gallery", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateGalleryItemBodySchema.safeParse(req.body);
  if (!parsed.success || !parsed.data) {
    res.status(400).json({ error: "Invalid input", details: parsed.error?.issues });
    return;
  }
  const data = parsed.data;
  const [created] = await db
    .insert(galleryItemsTable)
    .values({
      section: data.section,
      imageUrl: data.imageUrl,
      title: data.title ?? null,
      styleType: data.styleType ?? null,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to create" });
    return;
  }
  res.status(201).json(serialize(created));
});

router.delete("/gallery/:id", async (req: Request, res: Response): Promise<void> => {
  const parsed = DeleteGalleryItemParams.safeParse(req.params);
  if (!parsed.success || !parsed.data) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const result = await db
    .delete(galleryItemsTable)
    .where(eq(galleryItemsTable.id, parsed.data.id))
    .returning();
  if (result.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});

export default router;
