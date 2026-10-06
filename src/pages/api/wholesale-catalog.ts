import type { NextApiRequest, NextApiResponse } from "next";
import {
  filterWholesaleCatalog,
  wholesaleCatalog,
  wholesaleFacets,
} from "@/lib/wholesaleCatalog";
import { validWholesaleAccess, WHOLESALE_COOKIE } from "@/lib/wholesaleAccess.server";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método no permitido." });
  }
  if (!validWholesaleAccess(req.cookies[WHOLESALE_COOKIE])) {
    return res.status(401).json({ error: "Complete el registro de Mayoreo para consultar el catálogo." });
  }

  const allProducts = wholesaleCatalog();
  const products = filterWholesaleCatalog(allProducts, {
    search: String(req.query.search || ""),
    brand: String(req.query.brand || ""),
    category: String(req.query.category || ""),
  });
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 36));

  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({
    products: products.slice(offset, offset + limit),
    total: products.length,
    facets: wholesaleFacets(allProducts),
  });
}
