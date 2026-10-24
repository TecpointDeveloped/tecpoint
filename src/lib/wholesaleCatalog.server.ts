import { approvedCatalogProducts, enrichProduct } from "@/lib/catalog";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { wholesaleCatalog } from "@/lib/wholesaleCatalog";
import type { Product } from "@/types/ProductTypes";

/** Merge the current stock baseline with manual edits saved in the CRUD. */
export async function liveWholesaleCatalog() {
  const baseline = approvedCatalogProducts();
  const admin = getFirebaseAdmin();
  const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;
  if (!admin || !collectionName) return wholesaleCatalog(baseline);

  const snapshot = await admin.db.collection(collectionName).get();
  const storedBySku = new Map<string, Product>();
  const ordered = [...snapshot.docs].sort((left, right) =>
    (left.data().updatedAt?.toMillis?.() || 0) - (right.data().updatedAt?.toMillis?.() || 0),
  );
  ordered.forEach((document) => {
    const data = document.data() as Product;
    const sku = String(data.sku || "").trim().toLowerCase();
    if (sku) storedBySku.set(sku, data);
  });

  return wholesaleCatalog(baseline.map((product) => {
    const saved = storedBySku.get(product.sku.trim().toLowerCase());
    if (!saved) return product;
    return enrichProduct({
      ...product,
      ...saved,
      precio: { ...product.precio, ...saved.precio },
      extradata: { ...product.extradata, ...saved.extradata },
      imagenes: { ...product.imagenes, ...saved.imagenes },
    });
  }));
}

/** Resolve the sales ranking against products that are currently sellable in Mayoreo. */
export async function livePopularWholesaleProducts(products: ReturnType<typeof wholesaleCatalog>, limit = 12) {
  const admin = getFirebaseAdmin();
  if (!admin) return [];
  const snapshot = await admin.db.collection("wholesale_settings").doc("popular_products").get();
  if (!snapshot.exists) return [];

  const ranking = snapshot.data()?.ranking;
  if (!Array.isArray(ranking)) return [];
  const productBySku = new Map(products.map((product) => [product.sku.trim().toUpperCase(), product]));

  return ranking
    .map((item: { sku?: unknown }) => productBySku.get(String(item.sku || "").trim().toUpperCase()))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .slice(0, limit);
}
