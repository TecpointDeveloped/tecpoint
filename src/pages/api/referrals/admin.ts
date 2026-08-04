import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { INITIAL_REFERRAL_CODES, normalizeReferralCode, type ReferralCode, type ReferralOwnerType } from "@/lib/referrals";

async function requireAdmin(req: NextApiRequest) {
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  if (decoded.role !== "admin") return null;
  return admin;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return res.status(503).json({ error: "Configure Firebase Admin y acceda con una cuenta administradora." });

    if (req.method === "GET") {
      const [codesSnapshot, usesSnapshot] = await Promise.all([
        admin.db.collection("referral_codes").orderBy("ownerName").get(),
        admin.db.collection("referral_redemptions").orderBy("createdAt", "desc").limit(100).get(),
      ]);
      return res.status(200).json({
        codes: codesSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
        uses: usesSnapshot.docs.map((item) => ({ id: item.id, ...item.data(), createdAt: item.data().createdAt?.toDate?.().toISOString() || null })),
      });
    }

    if (req.method === "POST" && req.body?.action === "initialize") {
      const batch = admin.db.batch();
      INITIAL_REFERRAL_CODES.forEach((code) => batch.set(admin.db.collection("referral_codes").doc(code.code), {
        ...code,
        uses: FieldValue.increment(0),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true }));
      await batch.commit();
      return res.status(201).json({ created: INITIAL_REFERRAL_CODES.length });
    }

    if (req.method === "POST") {
      const code = normalizeReferralCode(req.body?.code);
      const ownerName = String(req.body?.ownerName || "").trim().slice(0, 80);
      const ownerType = String(req.body?.ownerType || "employee") as ReferralOwnerType;
      if (!code || !ownerName || !["employee", "influencer", "tecpoint"].includes(ownerType)) return res.status(400).json({ error: "Datos inválidos." });
      const record: ReferralCode = { code, ownerName, ownerType, discountPercent: 15, active: true, uses: 0 };
      await admin.db.collection("referral_codes").doc(code).set({ ...record, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      return res.status(201).json(record);
    }

    if (req.method === "PATCH") {
      const code = normalizeReferralCode(req.body?.code);
      if (!code) return res.status(400).json({ error: "Código inválido." });
      await admin.db.collection("referral_codes").doc(code).update({ active: Boolean(req.body?.active), updatedAt: FieldValue.serverTimestamp() });
      return res.status(200).json({ code, active: Boolean(req.body?.active) });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (error) {
    console.error("Referral admin error", error);
    return res.status(500).json({ error: "No fue posible procesar la solicitud." });
  }
}
