import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextApiRequest } from "next";

export const WHOLESALE_ADMIN_COOKIE = "tecpoint_wholesale_admin";
export const WHOLESALE_ADMIN_USER = "TECPOINT MAYOREO";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env.WHOLESALE_ADMIN_SESSION_SECRET
    || process.env.FIREBASE_ADMIN_PRIVATE_KEY
    || process.env.WHOLESALE_ADMIN_PASSWORD
    || "50498191003";
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function validWholesaleCredentials(username: unknown, password: unknown) {
  const normalizedUser = String(username || "").trim().replace(/\s+/g, " ").toUpperCase();
  const configuredPassword = process.env.WHOLESALE_ADMIN_PASSWORD || "50498191003";
  return safeEqual(normalizedUser, WHOLESALE_ADMIN_USER) && safeEqual(String(password || ""), configuredPassword);
}

export function createWholesaleAdminSession() {
  const payload = String(Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS);
  return `${payload}.${signature(payload)}`;
}

export function validWholesaleAdminSession(req: NextApiRequest) {
  const token = req.cookies[WHOLESALE_ADMIN_COOKIE] || "";
  const [expires, providedSignature] = token.split(".");
  if (!expires || !providedSignature || Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(providedSignature, signature(expires));
}

export function wholesaleAdminCookie(value: string, maxAge = MAX_AGE_SECONDS) {
  return `${WHOLESALE_ADMIN_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}
