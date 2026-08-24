import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

const collections = { banner: "site_banners", promotion: "flash_promotions" } as const;
type AssetKind = keyof typeof collections;

async function requireAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  return decoded.role === "admin" ? admin : null;
}

function safeText(value: unknown, max = 1000) {
  return String(value ?? "").trim().slice(0, max);
}

function kindFrom(value: unknown): AssetKind | null {
  return value === "banner" || value === "promotion" ? value : null;
}

function timestamp(value: unknown) {
  const date = value ? new Date(String(value)) : null;
  return date && !Number.isNaN(date.getTime()) ? Timestamp.fromDate(date) : null;
}

function payload(body: Record<string, unknown>) {
  const mediaType = body.mediaType === "video" ? "video" : "image";
  return {
    title: safeText(body.title, 180), subtitle: safeText(body.subtitle, 350), mediaType,
    imageUrl: safeText(body.imageUrl, 2000), mobileImageUrl: safeText(body.mobileImageUrl, 2000),
    videoUrl: safeText(body.videoUrl, 2000), mobileVideoUrl: safeText(body.mobileVideoUrl, 2000),
    posterUrl: safeText(body.posterUrl, 2000), linkUrl: safeText(body.linkUrl, 1000),
    cta: safeText(body.cta, 80), alt: safeText(body.alt, 220), artworkOnly: Boolean(body.artworkOnly),
    active: body.active !== false, sortOrder: Number(body.sortOrder) || 0,
    startsAt: timestamp(body.startsAt), endsAt: timestamp(body.endsAt), updatedAt: FieldValue.serverTimestamp(),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return res.status(403).json({ error: "Acceso administrativo requerido." });
    if (req.method === "GET") {
      const read = async (kind: AssetKind) => {
        const snapshot = await admin.db.collection(collections[kind]).orderBy("sortOrder").get();
        return snapshot.docs.map((entry) => {
          const data = entry.data();
          return { id: entry.id, kind, ...data, startsAt: data.startsAt?.toDate?.().toISOString() || null, endsAt: data.endsAt?.toDate?.().toISOString() || null, updatedAt: data.updatedAt?.toDate?.().toISOString() || null };
        });
      };
      const [banners, promotions] = await Promise.all([read("banner"), read("promotion")]);
      return res.status(200).json({ banners, promotions });
    }
    const kind = kindFrom(req.body?.kind);
    if (!kind) return res.status(400).json({ error: "Tipo de contenido inválido." });
    if (req.method === "POST") {
      const record = payload(req.body || {});
      if (!record.title || (record.mediaType === "image" ? !record.imageUrl : !record.videoUrl)) return res.status(400).json({ error: "Agregue un título y el archivo principal." });
      const created = await admin.db.collection(collections[kind]).add({ ...record, createdAt: FieldValue.serverTimestamp() });
      return res.status(201).json({ id: created.id });
    }
    if (req.method === "PATCH") {
      const id = safeText(req.body?.id, 200);
      if (!id) return res.status(400).json({ error: "Contenido inválido." });
      await admin.db.collection(collections[kind]).doc(id).update(payload(req.body || {}));
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "Método no permitido." });
  } catch (error) {
    console.error("Marketing admin error", error);
    return res.status(500).json({ error: "No fue posible administrar el contenido." });
  }
}
