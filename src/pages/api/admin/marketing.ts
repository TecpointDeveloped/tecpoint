import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { isAdminEmail } from "@/lib/adminAccess";

const collections = { banner: "site_banners", promotion: "flash_promotions" } as const;
type AssetKind = keyof typeof collections;

const legacyBanners = [
  ["xo-main", "XO: nuevos ingresos", "XO BANNER NUEVO.png", "XO"],
  ["deken-june", "Deken: protección actual", "BANNER DEKEN JUNIO2026.png", "Deken"],
  ["xo-02", "XO: tecnología para su día", "XO BANNER NUEVO 2.png", "XO"],
  ["xo-03", "XO: conecte con lo nuevo", "XO BANNER NUEVO 3.png", "XO"],
  ["hoco-01", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 1.png", "Hoco"],
  ["hoco-02", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 2.png", "Hoco"],
  ["hoco-03", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 3.png", "Hoco"],
  ["hoco-04", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 4.png", "Hoco"],
  ["hoco-05", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 5.png", "Hoco"],
  ["hoco-product", "HOCO: producto nuevo", "ho-10132 banner hoco prooducto nuevo.png", "Hoco"],
] as const;

async function ensureLegacyBanners(admin: NonNullable<ReturnType<typeof getFirebaseAdmin>>) {
  const collection = admin.db.collection(collections.banner);
  const references = legacyBanners.map(([id]) => collection.doc(`campaign-${id}`));
  const documents = await admin.db.getAll(...references);
  const batch = admin.db.batch();
  let changes = 0;
  documents.forEach((document, index) => {
    if (document.exists) return;
    const [, title, fileName, brand] = legacyBanners[index];
    batch.set(document.ref, {
      title, subtitle: "", mediaType: "image",
      imageUrl: `/images/banners-current/${fileName}`, mobileImageUrl: "",
      videoUrl: "", mobileVideoUrl: "", posterUrl: "",
      linkUrl: `/shop?page=1&brand=${encodeURIComponent(brand)}`, cta: "Ver productos",
      alt: title, artworkOnly: true, active: true, archived: false, sortOrder: index,
      startsAt: null, endsAt: null,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    changes += 1;
  });
  if (changes) await batch.commit();
}

async function requireAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  return isAdminEmail(decoded.email) ? admin : null;
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
    active: body.active !== false, archived: body.archived === true, sortOrder: Number(body.sortOrder) || 0,
    startsAt: timestamp(body.startsAt), endsAt: timestamp(body.endsAt), updatedAt: FieldValue.serverTimestamp(),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return res.status(403).json({ error: "Acceso administrativo requerido." });
    if (req.method === "GET") {
      await ensureLegacyBanners(admin);
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
