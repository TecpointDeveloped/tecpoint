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

function hasRealProductImage(product: ReturnType<typeof wholesaleCatalog>[number]) {
  const image = String(product.image || "").trim().toLowerCase();
  return Boolean(image) &&
    !image.includes("/brand/isologo.svg") &&
    !image.includes("default-product") &&
    !image.includes("placeholder");
}

function imageBackfill(products: ReturnType<typeof wholesaleCatalog>, excluded: Set<string>, limit: number) {
  return products
    .filter((product) => hasRealProductImage(product) && !excluded.has(product.sku.trim().toUpperCase()))
    .sort((left, right) =>
      Number(right.discountPercent || 0) - Number(left.discountPercent || 0) ||
      right.stock - left.stock ||
      left.name.localeCompare(right.name, "es"),
    )
    .slice(0, limit);
}

/** Resolve the sales ranking and replace entries without a real photo. */
export async function livePopularWholesaleProducts(products: ReturnType<typeof wholesaleCatalog>, limit = 12) {
  const admin = getFirebaseAdmin();
  const productBySku = new Map(products.map((product) => [product.sku.trim().toUpperCase(), product]));
  let ranking: Array<{ sku?: unknown }> = [];
  if (admin) {
    const snapshot = await admin.db.collection("wholesale_settings").doc("popular_products").get();
    if (snapshot.exists && Array.isArray(snapshot.data()?.ranking)) {
      ranking = snapshot.data()?.ranking;
    }
  }

  const rankedWithImages = ranking
    .map((item) => productBySku.get(String(item.sku || "").trim().toUpperCase()))
    .filter((product): product is NonNullable<typeof product> => product !== undefined && hasRealProductImage(product));
  const selected = rankedWithImages.slice(0, limit);
  const selectedSkus = new Set(selected.map((product) => product.sku.trim().toUpperCase()));
  return [
    ...selected,
    ...imageBackfill(products, selectedSkus, Math.max(0, limit - selected.length)),
  ];
}
