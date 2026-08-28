import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { pendingW34DraftProducts } from "@/lib/w34Drafts";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  const expectedToken = process.env.W34_DRAFT_MIGRATION_TOKEN;
  if (!expectedToken || req.headers["x-migration-token"] !== expectedToken) {
    return res.status(403).json({ error: "Acceso denegado." });
  }
  const admin = getFirebaseAdmin();
  const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;
  if (!admin || !collectionName) return res.status(503).json({ error: "Firebase no está configurado." });

  const drafts = pendingW34DraftProducts();
  const collection = admin.db.collection(collectionName);
  const snapshot = await collection.get();
  const existingSkus = new Set(snapshot.docs.map((document) => clean(document.data().sku).toLowerCase()).filter(Boolean));
  const batch = admin.db.batch();
  let created = 0;
  let skipped = 0;

  drafts.forEach((product) => {
    if (existingSkus.has(clean(product.sku).toLowerCase())) {
      skipped += 1;
      return;
    }
    const reference = collection.doc(`w34-draft-${clean(product.sku).replace(/[^a-z0-9_-]+/gi, "-")}`);
    batch.set(reference, {
      sku: product.sku,
      producto: product.producto,
      slug: product.slug,
      descripcion: product.descripcion,
      categorias: product.categorias,
      Subcategorias: product.Subcategorias,
      marca_producto: product.marca_producto,
      precio: product.precio,
      imagenes: {},
      extradata: product.extradata,
      fecha_agregado: null,
      catalogStatus: "draft-missing-image",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    created += 1;
  });
  await batch.commit();
  return res.status(200).json({ ok: true, total: drafts.length, created, skipped });
}
