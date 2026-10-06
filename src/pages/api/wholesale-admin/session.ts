import type { NextApiRequest, NextApiResponse } from "next";
import {
  createWholesaleAdminSession,
  validWholesaleAdminSession,
  validWholesaleCredentials,
  wholesaleAdminCookie,
} from "@/lib/wholesaleAdminAuth.server";

const attempts = new Map<string, { count: number; resetAt: number }>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ authenticated: validWholesaleAdminSession(req) });
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", wholesaleAdminCookie("", 0));
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

  const key = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const current = attempts.get(key);
  if (current && current.resetAt > now && current.count >= 5) {
    return res.status(429).json({ error: "Demasiados intentos. Espere 15 minutos." });
  }
  if (!validWholesaleCredentials(req.body?.username, req.body?.password)) {
    attempts.set(key, current && current.resetAt > now ? { ...current, count: current.count + 1 } : { count: 1, resetAt: now + 15 * 60 * 1000 });
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
  }
  attempts.delete(key);
  res.setHeader("Set-Cookie", wholesaleAdminCookie(createWholesaleAdminSession()));
  return res.status(200).json({ ok: true });
}
