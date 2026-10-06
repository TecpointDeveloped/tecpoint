import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { isAdminEmail } from "@/lib/adminAccess";
import { validWholesaleAdminSession } from "@/lib/wholesaleAdminAuth.server";

export const config = { api: { bodyParser: { sizeLimit: "7mb" } } };

async function authorized(req: NextApiRequest) {
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  if (validWholesaleAdminSession(req)) return admin;
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  return isAdminEmail(decoded.email) ? admin : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  try {
    const admin = await authorized(req);
    if (!admin) return res.status(403).json({ error: "Acceso administrativo requerido." });
    const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const id = String(req.body?.id || "").trim().slice(0, 200);
    const match = String(req.body?.dataUrl || "").match(/^data:image\/(png|jpeg|jpg|webp|avif);base64,(.+)$/i);
    if (!collectionName || !bucketName) return res.status(503).json({ error: "Almacenamiento no configurado." });
    if (!id || !match) return res.status(400).json({ error: "Imagen o producto inválido." });
    const input = Buffer.from(match[2], "base64");
    if (!input.length || input.length > 6 * 1024 * 1024) return res.status(400).json({ error: "La imagen debe pesar menos de 6 MB." });
    const output = await sharp(input, { failOn: "none" }).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toBuffer();
    const token = randomUUID();
    const objectName = `wholesale-products/${id}-${Date.now()}.webp`;
    const file = admin.storage.bucket(bucketName).file(objectName);
    await file.save(output, { resumable: false, metadata: { contentType: "image/webp", cacheControl: "public,max-age=31536000,immutable", metadata: { firebaseStorageDownloadTokens: token } } });
    const url = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectName)}?alt=media&token=${token}`;
    await admin.db.collection(collectionName).doc(id).update({ "extradata.wholesaleImage": url });
    return res.status(200).json({ ok: true, url });
  } catch (error) {
    console.error("Wholesale image upload error", error);
    return res.status(500).json({ error: "No fue posible guardar la imagen." });
  }
}
