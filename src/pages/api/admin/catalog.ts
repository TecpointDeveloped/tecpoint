import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { approvedCatalogProducts, productQualityIssues } from "@/lib/catalog";
import type { Product } from "@/types/ProductTypes";

async function requireAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  return decoded.role === "admin" ? admin : null;
}

function text(value: unknown, max = 5000) {
  return String(value ?? "").trim().slice(0, max);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return res.status(403).json({ error: "Acceso administrativo requerido." });
    const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;
    if (!collectionName) return res.status(503).json({ error: "Colección de productos no configurada." });

    if (req.method === "GET") {
      const snapshot = await admin.db.collection(collectionName).get();
      const products = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Product));
      const skuCounts = new Map<string, number>();
      const upcCounts = new Map<string, number>();
      products.forEach((product) => {
        const sku = text(product.sku).toLowerCase();
        const upc = text(product.extradata?.upc).replace(/\s+/g, "");
        if (sku) skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
        if (upc) upcCounts.set(upc, (upcCounts.get(upc) || 0) + 1);
      });
      const items = products.map((product) => {
        const issues = productQualityIssues(product);
        const sku = text(product.sku).toLowerCase();
        const upc = text(product.extradata?.upc).replace(/\s+/g, "");
        const duplicates = [
          ...(sku && (skuCounts.get(sku) || 0) > 1 ? ["sku"] : []),
          ...(upc && (upcCounts.get(upc) || 0) > 1 ? ["upc"] : []),
        ];
        return { ...product, issues, duplicates, publicReady: issues.length === 0 && duplicates.length === 0 };
      });
      return res.status(200).json({
        summary: {
          total: items.length,
          ready: items.filter((item) => item.publicReady).length,
          incomplete: items.filter((item) => item.issues.length > 0).length,
          duplicates: items.filter((item) => item.duplicates.length > 0).length,
          wholesale: items.filter((item) => item.extradata?.wholesaleEnabled === true || Number(item.precio?.mayoreo) > 0).length,
        },
        items,
      });
    }

    if (req.method === "POST" && req.body?.action === "syncW34") {
      const approved = approvedCatalogProducts();
      const snapshot = await admin.db.collection(collectionName).get();
      const existingBySku = new Map(
        snapshot.docs
          .map((document) => [text(document.data().sku).toLowerCase(), document] as const)
          .filter(([sku]) => Boolean(sku)),
      );
      const batch = admin.db.batch();
      let created = 0;
      let updated = 0;

      approved.forEach((product) => {
        const skuKey = text(product.sku).toLowerCase();
        const existing = existingBySku.get(skuKey);
        const documentId = `w34-${text(product.sku, 100).replace(/[^a-z0-9_-]+/gi, "-")}`;
        const reference = existing?.ref || admin.db.collection(collectionName).doc(documentId);
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

    if (req.method === "PATCH") {
      const id = text(req.body?.id, 200);
      if (!id) return res.status(400).json({ error: "Producto inválido." });
      const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
      if ("producto" in req.body) updates.producto = text(req.body.producto, 250);
      if ("slug" in req.body) updates.slug = text(req.body.slug, 300);
      if ("descripcion" in req.body) updates.descripcion = text(req.body.descripcion, 8000);
      if ("categoria" in req.body) updates.categorias = [text(req.body.categoria, 120)];
      if ("subcategoria" in req.body) updates.Subcategorias = text(req.body.subcategoria, 120);
      if ("marca" in req.body) updates["marca_producto.marca"] = text(req.body.marca, 120);
      if ("upc" in req.body) updates["extradata.upc"] = text(req.body.upc, 80);
      if ("color" in req.body) updates["extradata.color"] = text(req.body.color, 80);
      if ("precioDetalle" in req.body) updates["precio.detalle"] = Math.max(0, Number(req.body.precioDetalle) || 0);
      if ("precioMayoreo" in req.body) updates["precio.mayoreo"] = Math.max(0, Number(req.body.precioMayoreo) || 0);
      if ("wholesaleEnabled" in req.body) updates["extradata.wholesaleEnabled"] = Boolean(req.body.wholesaleEnabled);
      if ("wholesaleCategory" in req.body) updates["extradata.wholesaleCategory"] = text(req.body.wholesaleCategory, 120);
      if ("imagen" in req.body) updates["imagenes.imagen_01"] = { id: "imagen_01", img: text(req.body.imagen, 2000) };
      await admin.db.collection(collectionName).doc(id).update(updates);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método no permitido." });
  } catch (error) {
    console.error("Catalog admin error", error);
    return res.status(500).json({ error: "No fue posible procesar el catálogo." });
  }
}
