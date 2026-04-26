import { Router, type IRouter, type Request, type Response } from "express";
import {
  ADMIN_COOKIE_NAME,
  makeAdminToken,
  verifyAdminToken,
} from "../middlewares/adminAuth";

const router: IRouter = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env["NODE_ENV"] === "production",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

router.post("/admin/login", async (req: Request, res: Response): Promise<void> => {
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) {
    res.status(500).json({ error: "Admin password not configured" });
    return;
  }
  if (password.length === 0 || password !== expected) {
    res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    return;
  }
  const token = await makeAdminToken();
  res.cookie(ADMIN_COOKIE_NAME, token, COOKIE_OPTS);
  res.json({ ok: true });
});

router.post("/admin/logout", (_req: Request, res: Response): void => {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

router.get("/admin/me", async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!token || typeof token !== "string") {
    res.status(401).json({ authenticated: false });
    return;
  }
  const ok = await verifyAdminToken(token);
  if (!ok) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true });
});

export default router;
