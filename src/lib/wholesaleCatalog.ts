import compatibilityData from "@/data/wholesale-compatibility-w43.json";
import recoveredMedia from "@/data/recovered-product-media.json";
import { approvedCatalogProducts, publicCatalog } from "@/lib/catalog";
import { cleanCategory, titleFacts } from "@/lib/wholesale-ui/productPresentation";
import { normalizeDevices, reviewedDevices, wholesalePricing, type DeviceCompatibility } from "@/lib/wholesale-ui/wholesaleProductRules";
import { Product } from "@/types/ProductTypes";

export type WholesaleProduct = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  thumbnail: string;
  gallery?: string[];
  devices: DeviceCompatibility[];
  classification: string;
  originalPrice: number | null;
  discountPercent: number | null;
  price: number | null;
  retailPrice: number | null;
  dozenPrice: number | null;
  description: string;
  specifications: Record<string, string>;
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
  const recovered = (recoveredMedia as Record<string, { image: string }>)[product.sku];
  return (
    product.extradata?.wholesaleImage ||
    recovered?.image ||
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
      const reference = (compatibilityData as Record<string, { devices?: DeviceCompatibility[]; classification?: string }>)[String(product.sku || "").trim().toLowerCase()];
      const devices = reviewedDevices(
        String(product.producto || ""),
        normalizeDevices(product.extradata?.compatibleDevices ?? reference?.devices),
        [product.extradata?.wholesaleCategory, ...(product.categorias || []), product.Subcategorias].filter(Boolean).join(" "),
      );
      const pricing = wholesalePricing(rawPrice, product.extradata?.wholesalePromotion);
      const image = imageFor(product);
      return {
        sku: String(product.sku || "").trim(),
        name: String(product.producto || "Producto TECPOINT").trim(),
        brand: String(product.marca_producto?.marca || "TECPOINT").trim(),
        category: cleanCategory(String(
          product.extradata?.wholesaleCategory ||
            product.categorias?.[0] ||
            "Otros",
        ).trim(), String(product.producto || ""), String(product.Subcategorias || "")),
        image,
        thumbnail: product.extradata?.wholesaleThumbnail || image,
        gallery: Object.values(product.imagenes || {}).map(entry => entry?.img).filter((url): url is string => typeof url === "string" && url.startsWith("/")),
        devices,
        classification: product.extradata?.wholesaleClassification ?? reference?.classification ?? "",
        ...pricing,
        retailPrice: Number(product.precio?.detalle || 0) > 0 ? Number(product.precio.detalle) : null,
        dozenPrice: null,
        description: String(product.descripcion || "").trim(),
        specifications: {
          ...titleFacts(String(product.producto || "")),
          ...Object.fromEntries(Object.entries(product.extradata?.especificaciones || {}).filter((entry): entry is [string, string] => typeof entry[1] === "string")),
        },
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
