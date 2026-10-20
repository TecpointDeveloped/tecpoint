import { approvedCatalogProducts, publicCatalog } from "@/lib/catalog";
import { Product } from "@/types/ProductTypes";

export type WholesaleProduct = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number | null;
  retailPrice: number | null;
  dozenPrice: number | null;
  description: string;
  subcategory: string;
  upc: string;
  stock: number;
};

const HIDDEN_WHOLESALE_BRANDS = new Set([
  "crystaltech",
  "itskins",
  "qmadix",
  "tekya",
  "xiaomi",
]);
let cachedProducts: WholesaleProduct[] | undefined;
let cachedFacets: { brands: string[]; categories: string[] } | undefined;
const searchIndex = new Map<string, string>();

function imageFor(product: Product) {
  return (
    product.extradata?.wholesaleImage ||
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

export function wholesaleCatalog(sourceProducts?: Product[]): WholesaleProduct[] {
  if (!sourceProducts && cachedProducts) return cachedProducts;
  const result = publicCatalog(sourceProducts || approvedCatalogProducts())
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
        retailPrice: Number(product.precio?.detalle || 0) > 0 ? Number(product.precio.detalle) : null,
        dozenPrice: null,
        description: String(product.descripcion || "").trim(),
        subcategory: String(product.Subcategorias || "").trim(),
        upc: String(product.extradata?.upc || "").trim(),
        stock: Math.max(0, Number(product.extradata?.inventoryQuantity || 0)),
      };
    })
    .sort((left, right) => {
      const brandOrder = left.brand.localeCompare(right.brand, "es");
      return brandOrder || left.name.localeCompare(right.name, "es");
    });
  result.forEach((product) => {
    searchIndex.set(product.sku, normalize(`${product.name} ${product.brand} ${product.sku}`));
  });
  if (!sourceProducts) cachedProducts = result;
  return result;
}

export function wholesaleFacets(products = wholesaleCatalog()) {
  if (products === cachedProducts && cachedFacets) return cachedFacets;
  const facets = {
    brands: Array.from(new Set(products.map((product) => product.brand))).sort(
      (a, b) => a.localeCompare(b, "es"),
    ),
    categories: Array.from(
      new Set(products.map((product) => product.category)),
    ).sort((a, b) => a.localeCompare(b, "es")),
  };
  if (products === cachedProducts) cachedFacets = facets;
  return facets;
}

export function filterWholesaleCatalog(
  products: WholesaleProduct[],
  filters: { search?: string; brand?: string; category?: string; liquidation?: boolean },
) {
  const query = normalize(String(filters.search || "").trim());
  return products.filter((product) => {
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.liquidation && product.stock > 2) return false;
    if (!query) return true;
    return (searchIndex.get(product.sku) || normalize(`${product.name} ${product.brand} ${product.sku}`)).includes(query);
  });
}
