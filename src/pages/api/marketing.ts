import type { NextApiRequest, NextApiResponse } from "next";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

function active(document: QueryDocumentSnapshot) {
  const data = document.data();
  const now = Date.now();
  const startsAt = data.startsAt?.toDate?.()?.getTime?.() || 0;
  const endsAt = data.endsAt?.toDate?.()?.getTime?.() || Number.MAX_SAFE_INTEGER;
  return data.active !== false && data.archived !== true && (data.imageUrl || data.videoUrl) && startsAt <= now && endsAt >= now;
}

function serialize(document: QueryDocumentSnapshot) {
  const data = document.data();
  return {
    id: document.id,
    title: data.title || "",
    subtitle: data.subtitle || "",
    mediaType: data.mediaType === "video" ? "video" : "image",
    imageUrl: data.imageUrl || "",
    mobileImageUrl: data.mobileImageUrl || "",
    videoUrl: data.videoUrl || "",
    mobileVideoUrl: data.mobileVideoUrl || "",
    posterUrl: data.posterUrl || "",
    linkUrl: data.linkUrl || "",
    cta: data.cta || "",
    alt: data.alt || data.title || "",
    artworkOnly: Boolean(data.artworkOnly),
    sortOrder: Number(data.sortOrder) || 0,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido." });
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  const admin = getFirebaseAdmin();
  if (!admin) return res.status(503).json({ error: "Contenido temporalmente no disponible." });
  try {
    const [bannerSnapshot, promotionSnapshot] = await Promise.all([
      admin.db.collection("site_banners").orderBy("sortOrder").get(),
      admin.db.collection("flash_promotions").orderBy("sortOrder").get(),
    ]);
    const banners = bannerSnapshot.docs.filter(active).map(serialize);
    const promotions = promotionSnapshot.docs.filter(active).map(serialize);
    return res.status(200).json({ banners, promotion: promotions[0] || null });
  } catch (error) {
    console.error("Public marketing error", error);
    return res.status(500).json({ error: "No fue posible cargar el contenido." });
  }
}
