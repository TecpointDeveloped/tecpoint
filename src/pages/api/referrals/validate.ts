import type { NextApiRequest, NextApiResponse } from "next";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { INITIAL_REFERRAL_CODES, normalizeReferralCode, verifiedReferralItems, type ReferralCode } from "@/lib/referrals";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const codeValue = normalizeReferralCode(req.body?.code);
  const items = verifiedReferralItems(req.body?.items);
  if (!codeValue || !items.length) return res.status(400).json({ error: "Código o productos inválidos." });

  let code: ReferralCode | undefined = INITIAL_REFERRAL_CODES.find((item) => item.code === codeValue);
  const admin = getFirebaseAdmin();
  if (admin) {
    const snapshot = await admin.db.collection("referral_codes").doc(codeValue).get();
    if (snapshot.exists) code = snapshot.data() as ReferralCode;
  }
  if (!code || !code.active) return res.status(404).json({ error: "El código no existe o no está activo." });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = Math.round(subtotal * (code.discountPercent / 100) * 100) / 100;
  return res.status(200).json({ code: code.code, ownerName: code.ownerName, ownerType: code.ownerType, discountPercent: code.discountPercent, subtotal, discount, total: subtotal - discount });
}
