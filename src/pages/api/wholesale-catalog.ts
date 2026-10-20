import type { NextApiRequest, NextApiResponse } from "next";
import {
  filterWholesaleCatalog,
  wholesaleFacets,
} from "@/lib/wholesaleCatalog";
import { liveWholesaleCatalog } from "@/lib/wholesaleCatalog.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método no permitido." });
  }

  const allProducts = await liveWholesaleCatalog();
  const products = filterWholesaleCatalog(allProducts, {
    search: String(req.query.search || ""),
    brand: String(req.query.brand || ""),
    category: String(req.query.category || ""),
    liquidation: req.query.liquidation === "1",
  });
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 24));

  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).json({
    products: products.slice(offset, offset + limit),
    total: products.length,
    facets: wholesaleFacets(allProducts),
  });
}
