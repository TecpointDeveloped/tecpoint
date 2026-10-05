import { approvedCatalogProducts, publicCatalog } from "@/lib/catalog";
import { Product } from "@/types/ProductTypes";

export type WholesaleProduct = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number | null;
  stock: number;
};

const HIDDEN_WHOLESALE_BRANDS = new Set([
  "crystaltech",
  "itskins",
  "qmadix",
  "tekya",
  "xiaomi",
]);

function imageFor(product: Product) {
  return (
    product.imagenes?.imagen_01?.img ||
    Object.values(product.imagenes || {})[0]?.img ||
    "/brand/isologo.svg"
  );
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function wholesaleCatalog(): WholesaleProduct[] {
  return publicCatalog(approvedCatalogProducts())
    .filter(
      (product) =>
        !HIDDEN_WHOLESALE_BRANDS.has(
          normalize(String(product.marca_producto?.marca || "")),
        ) &&
        product.extradata?.stock === true &&
        Number(product.extradata?.inventoryQuantity || 0) > 0 &&
        Number(product.precio?.mayoreo || 0) > 0 &&
        product.extradata?.wholesaleEnabled !== false,
    )
    .map((product) => {
      const rawPrice = Number(product.precio?.mayoreo || 0);
      return {
        sku: String(product.sku || "").trim(),
        name: String(product.producto || "Producto TECPOINT").trim(),
        brand: String(product.marca_producto?.marca || "TECPOINT").trim(),
        category: String(
          product.extradata?.wholesaleCategory ||
            product.categorias?.[0] ||
            "Otros",
        ).trim(),
        image: imageFor(product),
        price: rawPrice > 0 ? rawPrice : null,
        stock: Math.max(0, Number(product.extradata?.inventoryQuantity || 0)),
      };
    })
    .sort((left, right) => {
      const brandOrder = left.brand.localeCompare(right.brand, "es");
      return brandOrder || left.name.localeCompare(right.name, "es");
    });
}

export function wholesaleFacets(products = wholesaleCatalog()) {
  return {
    brands: Array.from(new Set(products.map((product) => product.brand))).sort(
      (a, b) => a.localeCompare(b, "es"),
    ),
    categories: Array.from(
      new Set(products.map((product) => product.category)),
    ).sort((a, b) => a.localeCompare(b, "es")),
  };
}

export function filterWholesaleCatalog(
  products: WholesaleProduct[],
  filters: { search?: string; brand?: string; category?: string },
) {
  const query = normalize(String(filters.search || "").trim());
  return products.filter((product) => {
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (!query) return true;
    return normalize(`${product.name} ${product.brand} ${product.sku}`).includes(
      query,
    );
  });
}
