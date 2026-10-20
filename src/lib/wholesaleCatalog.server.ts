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
