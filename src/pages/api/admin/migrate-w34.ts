import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { approvedCatalogProducts } from "@/lib/catalog";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  const expectedToken = process.env.W34_MIGRATION_TOKEN;
  if (!expectedToken || req.headers["x-migration-token"] !== expectedToken) {
    return res.status(403).json({ error: "Acceso denegado." });
  }
  const admin = getFirebaseAdmin();
  const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;
  if (!admin || !collectionName) return res.status(503).json({ error: "Firebase no está configurado." });

  const approved = approvedCatalogProducts();
  const collection = admin.db.collection(collectionName);
  const snapshot = await collection.get();
  const existingBySku = new Map(
    snapshot.docs
      .map((document) => [clean(document.data().sku).toLowerCase(), document] as const)
      .filter(([sku]) => Boolean(sku)),
  );
  const batch = admin.db.batch();
  let created = 0;
  let updated = 0;

  approved.forEach((product) => {
    const skuKey = clean(product.sku).toLowerCase();
    const existing = existingBySku.get(skuKey);
    const documentId = `w34-${clean(product.sku).replace(/[^a-z0-9_-]+/gi, "-")}`;
    const reference = existing?.ref || collection.doc(documentId);
    batch.set(reference, {
      sku: product.sku,
      producto: product.producto,
      slug: product.slug,
      descripcion: product.descripcion,
      categorias: product.categorias,
      Subcategorias: product.Subcategorias,
      marca_producto: product.marca_producto,
      precio: product.precio,
      imagenes: product.imagenes,
      extradata: product.extradata,
      fecha_agregado: product.fecha_agregado,
      updatedAt: FieldValue.serverTimestamp(),
      ...(!existing ? { createdAt: FieldValue.serverTimestamp() } : {}),
    }, { merge: true });
    if (existing) updated += 1;
    else created += 1;
  });
  await batch.commit();
  return res.status(200).json({ ok: true, total: approved.length, created, updated });
}
