import type { Request, Response, NextFunction } from "express";

export const ADMIN_COOKIE_NAME = "qassa_admin";

function getSecret(): string {
  return process.env["SESSION_SECRET"] || "dev-only-insecure-secret";
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function makeAdminToken(): Promise<string> {
  const payload = `admin.${Date.now()}`;
  const sig = await hmacHex(payload, getSecret());
  return `${payload}.${sig}`;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, ts, sig] = parts;
  if (role !== "admin" || !ts || !sig) return false;
  const expected = await hmacHex(`${role}.${ts}`, getSecret());
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const ok = await verifyAdminToken(token);
  if (!ok) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
