import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { isAdminEmail } from "@/lib/adminAccess";
import { validWholesaleAdminSession } from "@/lib/wholesaleAdminAuth.server";
import { parseWholesaleSalesWorkbook } from "@/lib/wholesaleSales.server";
import { wholesaleCatalog } from "@/lib/wholesaleCatalog";
import type { Product } from "@/types/ProductTypes";

const SETTINGS_COLLECTION = "wholesale_settings";
const POPULAR_PRODUCTS_DOCUMENT = "popular_products";
const MAX_FILE_BYTES = 6 * 1024 * 1024;

async function requireAdmin(req: NextApiRequest) {
  const admin = getFirebaseAdmin();
  if (validWholesaleAdminSession(req)) return admin;
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token || !admin) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  return isAdminEmail(decoded.email) ? admin : null;
}

function cleanFileName(value: unknown) {
  return String(value || "ventas.xlsx").replace(/[^a-zA-Z0-9._ -]/g, "").slice(0, 160) || "ventas.xlsx";
}

export const config = {
  api: { bodyParser: { sizeLimit: "9mb" } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return res.status(403).json({ error: "Acceso administrativo requerido." });

    const reference = admin.db.collection(SETTINGS_COLLECTION).doc(POPULAR_PRODUCTS_DOCUMENT);

    if (req.method === "GET") {
      const snapshot = await reference.get();
      if (!snapshot.exists) return res.status(200).json({ configured: false, ranking: [] });
      const data = snapshot.data() || {};
      return res.status(200).json({
        configured: true,
        fileName: data.fileName || "",
        processedRows: Number(data.processedRows || 0),
        matchedCount: Number(data.matchedCount || 0),
        unmatchedSkus: Array.isArray(data.unmatchedSkus) ? data.unmatchedSkus : [],
        quantityColumnDetected: Boolean(data.quantityColumnDetected),
        worksheets: Array.isArray(data.worksheets) ? data.worksheets : [],
        ranking: Array.isArray(data.ranking) ? data.ranking.slice(0, 20) : [],
        uploadedAt: data.uploadedAt?.toDate?.().toISOString() || null,
      });
    }

    if (req.method === "POST") {
      const fileName = cleanFileName(req.body?.fileName);
      if (!fileName.toLowerCase().endsWith(".xlsx")) {
        return res.status(400).json({ error: "Suba un archivo Excel con extensión .xlsx." });
      }
      const dataBase64 = String(req.body?.dataBase64 || "");
      if (!dataBase64) return res.status(400).json({ error: "No se recibió el archivo Excel." });
      const buffer = Buffer.from(dataBase64, "base64");
      if (!buffer.length || buffer.length > MAX_FILE_BYTES) {
        return res.status(400).json({ error: "El Excel debe pesar menos de 6 MB." });
      }

      const result = await parseWholesaleSalesWorkbook(buffer);
      const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;
      if (!collectionName) return res.status(503).json({ error: "Colección de productos no configurada." });

      const productsSnapshot = await admin.db.collection(collectionName).get();
      const catalogProducts = productsSnapshot.docs.map((document) => document.data() as Product);
      const visibleWholesaleSkus = new Set(
        wholesaleCatalog(catalogProducts).map((product) => product.sku.trim().toUpperCase()),
      );
      const productBySku = new Map<string, { name: string; visible: boolean }>();
      productsSnapshot.docs.forEach((document) => {
        const data = document.data();
        const sku = String(data.sku || "").trim().toUpperCase();
        if (!sku) return;
        productBySku.set(sku, {
          name: String(data.producto || "Producto TECPOINT"),
          visible: visibleWholesaleSkus.has(sku),
        });
      });

      const unmatchedSkus = result.ranking
        .filter((item) => !productBySku.has(item.sku))
        .map((item) => item.sku);
      const matchedCount = result.ranking.filter((item) => productBySku.has(item.sku)).length;
      const ranking = result.ranking.slice(0, 200).map((item) => ({
        ...item,
        name: productBySku.get(item.sku)?.name || "No encontrado en el catálogo",
        catalogVisible: Boolean(productBySku.get(item.sku)?.visible),
      }));
      await reference.set({
        fileName,
        processedRows: result.processedRows,
        matchedCount,
        unmatchedSkus: unmatchedSkus.slice(0, 100),
        quantityColumnDetected: result.quantityColumnDetected,
        worksheets: result.worksheets,
        ranking,
        uploadedAt: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        ok: true,
        configured: true,
        fileName,
        processedRows: result.processedRows,
        matchedCount,
        unmatchedSkus: unmatchedSkus.slice(0, 100),
        quantityColumnDetected: result.quantityColumnDetected,
        worksheets: result.worksheets,
        ranking: ranking.slice(0, 20),
      });
    }

    return res.status(405).json({ error: "Método no permitido." });
  } catch (error) {
    console.error("Wholesale sales upload error", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "No fue posible procesar el Excel.",
    });
  }
}
