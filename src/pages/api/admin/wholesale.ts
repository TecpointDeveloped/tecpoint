import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

async function requireAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const admin = getFirebaseAdmin();
  if (!token || !admin) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  return decoded.role === "admin" ? admin : null;
}

function text(value: unknown, max = 300) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return res.status(403).json({ error: "Acceso administrativo requerido." });
    const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;
    if (!collectionName) return res.status(503).json({ error: "Colección de productos no configurada." });

    if (req.method === "GET") {
      if (req.query.view === "leads") {
        const leadSnapshot = await admin.db.collection("wholesale_leads").orderBy("createdAt", "desc").limit(250).get();
        const leads = leadSnapshot.docs.map((document) => {
          const data = document.data();
          return { id:document.id,name:data.name||"",whatsapp:data.whatsapp||"",email:data.email||"",storeName:data.storeName||"",status:data.status||"new",createdAt:data.createdAt?.toDate?.().toISOString()||null };
        });
        return res.status(200).json({ leads });
      }
      const productSnapshot = await admin.db.collection(collectionName).get();
      const products = productSnapshot.docs.map((document) => {
        const data = document.data();
        const firstImage = Object.values(data.imagenes || {})[0] as { img?: string } | undefined;
        return {
          id: document.id,
          sku: data.sku || "",
          producto: data.producto || "",
          brand: data.marca_producto?.marca || "",
          image: data.imagenes?.imagen_01?.img || firstImage?.img || "",
          retailPrice: Number(data.precio?.detalle) || 0,
          wholesalePrice: Number(data.precio?.mayoreo) || 0,
          wholesaleEnabled: data.extradata?.wholesaleEnabled === true,
          wholesaleCategory: data.extradata?.wholesaleCategory || data.categorias?.[0] || "",
        };
      });
      const search = text(req.query.query, 160).toLowerCase();
      const filtered = products.filter((product) => !search || `${product.sku} ${product.producto} ${product.brand} ${product.wholesaleCategory}`.toLowerCase().includes(search));
      const pageSize = 30;
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const page = Math.min(totalPages, Math.max(1, Number(req.query.page) || 1));
      return res.status(200).json({ products:filtered.slice((page-1)*pageSize,page*pageSize),pagination:{page,pageSize,totalItems:filtered.length,totalPages},summary:{active:products.filter(product=>product.wholesaleEnabled&&product.wholesalePrice>0).length,categories:new Set(products.map(product=>product.wholesaleCategory).filter(Boolean)).size} });
    }

    if (req.method === "PATCH" && req.body?.target === "product") {
      const id = text(req.body.id, 200);
      if (!id) return res.status(400).json({ error: "Producto inválido." });
      await admin.db.collection(collectionName).doc(id).update({
        "precio.mayoreo": Math.max(0, Number(req.body.wholesalePrice) || 0),
        "extradata.wholesaleEnabled": Boolean(req.body.wholesaleEnabled),
        "extradata.wholesaleCategory": text(req.body.wholesaleCategory, 120),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "PATCH" && req.body?.target === "lead") {
      const id = text(req.body.id, 200);
      const status = ["new", "contacted", "approved", "closed"].includes(req.body.status)
        ? req.body.status
        : "new";
      if (!id) return res.status(400).json({ error: "Solicitud inválida." });
      await admin.db.collection("wholesale_leads").doc(id).update({
        status,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método no permitido." });
  } catch (error) {
    console.error("Wholesale admin error", error);
    return res.status(500).json({ error: "No fue posible cargar Mayoreo." });
  }
}
