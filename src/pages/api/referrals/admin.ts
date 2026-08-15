import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { INITIAL_REFERRAL_CODES, normalizeReferralCode, type ReferralCode, type ReferralOwnerType } from "@/lib/referrals";

type AdminAuthResult =
  | { ok: true; admin: NonNullable<ReturnType<typeof getFirebaseAdmin>> }
  | { ok: false; status: 401 | 403 | 503; error: string };

async function requireAdmin(req: NextApiRequest): Promise<AdminAuthResult> {
  let admin: ReturnType<typeof getFirebaseAdmin>;
  try {
    admin = getFirebaseAdmin();
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
    return { ok: false, status: 503, error: "Firebase Admin no está disponible en el servidor." };
  }
  if (!admin) return { ok: false, status: 503, error: "Firebase Admin no está configurado en el servidor." };
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false, status: 401, error: "Debe iniciar sesión." };
  try {
    const decoded = await admin.auth.verifyIdToken(token);
    if (decoded.role !== "admin") return { ok: false, status: 403, error: "Esta cuenta no tiene permisos administrativos." };
    return { ok: true, admin };
  } catch {
    return { ok: false, status: 401, error: "La sesión no es válida o expiró." };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
    const { admin } = auth;

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
