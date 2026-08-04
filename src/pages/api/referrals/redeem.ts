import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { INITIAL_REFERRAL_CODES, normalizeReferralCode, verifiedReferralItems, type ReferralCode } from "@/lib/referrals";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const admin = getFirebaseAdmin();
  if (!admin) return res.status(503).json({ error: "El registro de referidos todavía no está configurado en el servidor." });
  const codeValue = normalizeReferralCode(req.body?.code);
  const items = verifiedReferralItems(req.body?.items);
  let code: ReferralCode | undefined = INITIAL_REFERRAL_CODES.find((item) => item.code === codeValue);
  const codeRef = admin.db.collection("referral_codes").doc(codeValue);
  const codeSnapshot = await codeRef.get();
  if (codeSnapshot.exists) code = codeSnapshot.data() as ReferralCode;
  if (!code || !code.active || !items.length) return res.status(400).json({ error: "No fue posible registrar el código." });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = Math.round(subtotal * (code.discountPercent / 100) * 100) / 100;
  const redemption = await admin.db.collection("referral_redemptions").add({ code: code.code, ownerName: code.ownerName, ownerType: code.ownerType, discountPercent: code.discountPercent, items, subtotal, discount, total: subtotal - discount, channel: req.body?.channel || "web_whatsapp", location: String(req.body?.location || "online").slice(0, 80), status: "ordered", timezone: "America/Tegucigalpa", createdAt: FieldValue.serverTimestamp() });
  await codeRef.set({ ...code, uses: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return res.status(201).json({ id: redemption.id, discount, total: subtotal - discount });
}
