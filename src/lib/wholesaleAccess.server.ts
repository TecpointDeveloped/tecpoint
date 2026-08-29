import { createHmac, timingSafeEqual } from "node:crypto";

export const WHOLESALE_COOKIE = "tecpoint_wholesale_access";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret() {
  return process.env.WHOLESALE_ACCESS_SECRET || process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
}

function signature(timestamp: string) {
  return createHmac("sha256", secret()).update(timestamp).digest("hex");
}

export function createWholesaleAccess() {
  const timestamp = String(Math.floor(Date.now() / 1000));
  return `${timestamp}.${signature(timestamp)}`;
}

export function validWholesaleAccess(value?: string) {
  const [timestamp, provided] = String(value || "").split(".");
  if (!secret() || !/^\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(provided || "")) return false;
  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (age < 0 || age > MAX_AGE_SECONDS) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(signature(timestamp)));
}

export function wholesaleCookieHeader() {
  return `${WHOLESALE_COOKIE}=${createWholesaleAccess()}; Path=/mayoreo; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}
