import { Router, type IRouter, type Request, type Response } from "express";
import { db, bookingsTable } from "@workspace/db";
import {
  CreateBookingBodySchema,
  GetBookingParams,
  UpdateBookingStatusBodySchema,
  UpdateBookingStatusParams,
  ListBookingsQueryParams,
} from "@workspace/api-zod";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";

const router: IRouter = Router();

function serializeBooking(b: typeof bookingsTable.$inferSelect) {
  return {
    id: b.id,
    fullName: b.fullName,
    phone: b.phone,
    blockNumber: b.blockNumber,
    buildingNumber: b.buildingNumber,
    apartmentNumber: b.apartmentNumber,
    scheduledAt: b.scheduledAt.toISOString(),
    status: b.status,
    notes: b.notes,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

router.post("/bookings", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateBookingBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  const [created] = await db
    .insert(bookingsTable)
    .values({
      fullName: data.fullName,
      phone: data.phone,
      blockNumber: data.blockNumber,
      buildingNumber: data.buildingNumber,
      apartmentNumber: data.apartmentNumber,
      scheduledAt: new Date(data.scheduledAt),
      notes: data.notes ?? null,
      status: "pending",
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to create booking" });
    return;
  }
  res.status(201).json(serializeBooking(created));
});

router.get("/bookings", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = ListBookingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    return;
  }
  const status = parsed.data?.status;
  const rows = status
    ? await db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.status, status))
        .orderBy(desc(bookingsTable.createdAt))
    : await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
  res.json(rows.map(serializeBooking));
});

router.get("/bookings/:id", async (req: Request, res: Response): Promise<void> => {
  const parsed = GetBookingParams.safeParse(req.params);
  if (!parsed.success || !parsed.data) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, parsed.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeBooking(row));
});

router.patch("/bookings/:id/status", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const paramsParsed = UpdateBookingStatusParams.safeParse(req.params);
  if (!paramsParsed.success || !paramsParsed.data) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateBookingStatusBodySchema.safeParse(req.body);
  if (!bodyParsed.success || !bodyParsed.data) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const [updated] = await db
    .update(bookingsTable)
    .set({ status: bodyParsed.data.status, updatedAt: new Date() })
    .where(eq(bookingsTable.id, paramsParsed.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeBooking(updated));
});

router.get(
  "/bookings/:id/queue-position",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = GetBookingParams.safeParse(req.params);
    if (!parsed.success || !parsed.data) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [row] = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, parsed.data.id));
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const waiting = await db
      .select({ id: bookingsTable.id, createdAt: bookingsTable.createdAt })
      .from(bookingsTable)
      .where(eq(bookingsTable.status, "pending"))
      .orderBy(bookingsTable.createdAt);

    const totalWaiting = waiting.length;
    let position = 0;
    if (row.status === "pending") {
      const idx = waiting.findIndex((w) => w.id === row.id);
      position = idx >= 0 ? idx + 1 : 0;
    }

    const [serving] = await db
      .select({ id: bookingsTable.id })
      .from(bookingsTable)
      .where(eq(bookingsTable.status, "in_progress"))
      .orderBy(bookingsTable.updatedAt)
      .limit(1);

    res.json({
      bookingId: row.id,
      status: row.status,
      position,
      totalWaiting,
      currentlyServing: serving?.id ?? null,
    });
  },
);

router.get("/queue/summary", async (_req: Request, res: Response): Promise<void> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfDay);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [waitingRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "pending"));
  const [inProgressRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "in_progress"));
  const [completedRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.status, "completed"),
        gte(bookingsTable.updatedAt, startOfDay),
        lt(bookingsTable.updatedAt, startOfTomorrow),
      ),
    );

  res.json({
    totalWaiting: waitingRow?.c ?? 0,
    inProgress: inProgressRow?.c ?? 0,
    completedToday: completedRow?.c ?? 0,
  });
});

router.get("/admin/stats", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfDay);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [totalRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingsTable);
  const [pendingRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "pending"));
  const [inProgressRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "in_progress"));
  const [completedRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "completed"));
  const [cancelledRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "cancelled"));
  const [todayRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(
      and(
        gte(bookingsTable.createdAt, startOfDay),
        lt(bookingsTable.createdAt, startOfTomorrow),
      ),
    );

  res.json({
    totalBookings: totalRow?.c ?? 0,
    pendingCount: pendingRow?.c ?? 0,
    inProgressCount: inProgressRow?.c ?? 0,
    completedCount: completedRow?.c ?? 0,
    cancelledCount: cancelledRow?.c ?? 0,
    todayBookings: todayRow?.c ?? 0,
  });
});

export default router;
