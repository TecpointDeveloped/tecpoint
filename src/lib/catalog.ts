import { Product } from "@/types/ProductTypes";
import validatedCatalog from "@/data/validated-web-catalog.json";
import currentCatalog from "@/data/current-catalog-w35.json";
import approvedImages from "@/data/approved-product-images.json";
import { brandLogo, canonicalBrandName } from "@/lib/brands";

export const OFFICIAL_CATEGORIES = [
  {
    name: "Power & Charge",
    slug: "power-and-charge",
    description: "Cargadores, cables, adaptadores y energía portátil.",
  },
  {
    name: "Screen Protection",
    slug: "screen-protection",
    description: "Protección de pantalla y privacidad para cada dispositivo.",
  },
  {
    name: "Sound Essentials",
    slug: "sound-essentials",
    description: "Audífonos, auriculares, parlantes y accesorios de audio.",
  },
  {
    name: "Smart Tech",
    slug: "smart-tech",
    description: "Cases, relojes, soportes y tecnología para el día a día.",
  },
  {
    name: "Travel & Carry",
    slug: "travel-and-carry",
    description: "Bolsos, organizadores y accesorios para llevar su tecnología.",
  },
  {
    name: "Smart Drive",
    slug: "smart-drive",
    description: "Carga, soporte, audio y seguridad para el vehículo.",
  },
  {
    name: "Outdoor Pro",
    slug: "outdoor-pro",
    description: "Tecnología resistente para actividades y espacios exteriores.",
  },
  {
    name: "Accesorios Genéricos",
    slug: "accesorios-genericos",
    description: "Accesorios funcionales sin una marca comercial asignada.",
  },
] as const;

type CatalogProduct = Pick<
  Product,
  "sku" | "producto" | "slug" | "descripcion" | "categorias" | "Subcategorias"
> & {
  marca_producto?: { marca?: string };
  precio?: Product["precio"];
  extradata?: Product["extradata"];
};

type ValidatedEntry = {
  name: string;
  slug: string;
  brand: string;
  category: string;
  subcategory: string;
};

const records = validatedCatalog.records as Record<string, ValidatedEntry>;
const currentInventory = new Map(
  currentCatalog.records.map((item) => [String(item.sku).trim(), item]),
);

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const SEARCH_ALIASES: Array<[RegExp, string]> = [
  [/\b(rock\s*space|rockspace|rok\s*space|rokspace)\b/g, " rockspace "],
  [/\b(celular|telefono|movil|smartphone)\b/g, " telefono "],
  [/\b(audifono|audifonos|auricular|auriculares|headset|earbuds)\b/g, " audifono "],
  [/\b(cargador|cargadores|charger|carga)\b/g, " cargador "],
  [/\b(cabeza|cabezal|cubo|cubito|taco|bloque|adaptador de pared)\b/g, " cargador "],
  [/\b(lamina|laminas|vidrio|protector|proteccion|film)\b/g, " protector "],
  [/\b(forro|funda|case|cobertor|forrito|cover|protector de telefono)\b/g, " case "],
  [/\b(bateria|powerbank|power bank)\b/g, " powerbank "],
  [/\b(reloj|smartwatch|watch)\b/g, " smartwatch "],
  [/\b(airpod|airpods|airdop|audifono inalambrico|audifonos inalambricos)\b/g, " audifono "],
  [/\b(cable tipo c|usb c|type c|tipo-c|tipoc)\b/g, " usb-c "],
  [/\b(iphone|aifon|ifon|ayfon)\b/g, " iphone "],
  [/\b(samsung|samsun|samsum|sansung)\b/g, " samsung "],
  [/\b(carro|vehiculo|auto|automovil)\b/g, " vehiculo "],
];

export function normalizeSearchText(value: string) {
  return SEARCH_ALIASES.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    normalizeText(value).replace(/[^a-z0-9]+/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

function tokenMatches(queryToken: string, candidateToken: string) {
  if (
    queryToken.length >= 3 &&
    candidateToken.length >= 3 &&
    (candidateToken.includes(queryToken) || queryToken.includes(candidateToken))
  ) {
    return true;
  }
  if (queryToken.length < 4 || candidateToken.length < 4) return false;
  const tolerance = queryToken.length >= 8 ? 2 : 1;
  return editDistance(queryToken, candidateToken) <= tolerance;
}

export function matchesProductSearch(product: CatalogProduct, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystack = normalizeSearchText(
    [
      preferredProductName(product),
      product.sku,
      product.descripcion,
      product.Subcategorias,
      product.marca_producto?.marca,
      Array.isArray(product.extradata?.tags) ? product.extradata?.tags.join(" ") : product.extradata?.tags,
      Array.isArray(product.extradata?.searchAliases) ? product.extradata?.searchAliases.join(" ") : product.extradata?.searchAliases,
      ...(product.categorias || []),
    ].join(" "),
  );

  if (haystack.includes(normalizedQuery)) return true;
  const candidateTokens = [...new Set(haystack.split(" ").filter(Boolean))];
  return normalizedQuery
    .split(" ")
    .filter(Boolean)
    .every((queryToken) =>
      candidateTokens.some((candidateToken) =>
        tokenMatches(queryToken, candidateToken),
      ),
    );
}

export function productSearchTerms(product: CatalogProduct) {
  const aliases = product.extradata?.searchAliases;
  const tags = product.extradata?.tags;
  return [...new Set([
    preferredProductName(product),
    product.marca_producto?.marca,
    ...(product.categorias || []),
    product.Subcategorias,
    ...(Array.isArray(tags) ? tags : String(tags || "").split(",")),
    ...(Array.isArray(aliases) ? aliases : String(aliases || "").split(",")),
  ].map((item) => String(item || "").trim()).filter(Boolean))];
}

export function slugify(value: string) {
  return normalizeText(value)
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function cleanProductSlug(value: string, sku?: string) {
  const skuSlug = slugify(sku || "");
  const withoutSku = skuSlug
    ? slugify(value)
        .replace(new RegExp(`(?:^|-)${skuSlug}(?:-|$)`, "g"), "-")
        .replace(/^-+|-+$/g, "")
    : slugify(value);
  const tokens = withoutSku
    .split("-")
    .filter(Boolean);
  const withoutGenericPrefix =
    tokens[0] === "accesorio" && tokens[1] === "tecnologico"
      ? tokens.slice(2)
      : tokens;

  return withoutGenericPrefix
    .filter((token, index, list) => {
      if (index > 0 && token === list[index - 1]) return false;
      if (index > 1 && token === list[index - 2]) return false;
      return true;
    })
    .join("-");
}

export function getValidatedEntry(sku?: string) {
  return sku ? records[String(sku).trim()] : undefined;
}

export function getCurrentInventory(sku?: string) {
  return sku ? currentInventory.get(String(sku).trim()) : undefined;
}

export type ProductPromotion = {
  percent: number;
  regularPrice: number;
  promotionalPrice: number;
  label: string;
};

/**
 * Reads the active commercial promotion from the inventory source of truth.
 * We intentionally do not infer discounts from visual labels or product copy.
 */
export function productPromotion(product: CatalogProduct): ProductPromotion | null {
  const inventory = getCurrentInventory(product.sku);
  const category = String(inventory?.category || product.categorias?.[0] || "");
  const categoryMatch = category.match(/PROMOCI(?:O|Ó)N\s*(\d{1,2})\s*%/i);
  const explicitDiscount = Number(product.extradata?.discount || 0);
  const percent = categoryMatch ? Number(categoryMatch[1]) : explicitDiscount;
  const regularPrice = Number(inventory?.detailPrice || product.precio?.detalle || 0);

  if (!Number.isFinite(percent) || percent <= 0 || percent >= 100 || regularPrice <= 0) {
    return null;
  }

  return {
    percent,
    regularPrice,
    promotionalPrice: Math.round(regularPrice * (1 - percent / 100) * 100) / 100,
    label: `${percent}% DE DESCUENTO`,
  };
}

export function productAddedTime(product: Pick<Product, "fecha_agregado">) {
  if (!product.fecha_agregado) return 0;
  const time = new Date(product.fecha_agregado).getTime();
  return Number.isFinite(time) ? time : 0;
}

/** Products keep their entry date internally, but the storefront only exposes the badge. */
export function isNewProduct(product: Pick<Product, "fecha_agregado">, referenceTime = Date.now()) {
  const addedAt = productAddedTime(product);
  if (!addedAt) return false;
  const age = referenceTime - addedAt;
  const fortyFiveDays = 45 * 24 * 60 * 60 * 1000;
  return age >= 0 && age <= fortyFiveDays;
}

export function approvedCatalogProducts(includeMissingPrice = false): Product[] {
  const imageMap = approvedImages as Record<string, string>;
  return currentCatalog.records.flatMap((inventory) => {
    const sku = String(inventory.sku || "").trim();
    if (!sku || (!includeMissingPrice && inventory.detailPrice <= 0)) {
      return [];
    }
    const exactImage = imageMap[sku];
    const image = exactImage || "/brand/isologo.svg";
    const brand = canonicalBrandName(inventory.brand);
    const product = {
      id: `w35-${sku}`,
      sku,
      producto: inventory.description,
      slug: inventory.slug,
      descripcion: inventory.description,
      categorias: [inventory.category],
      Subcategorias: inventory.subcategory,
      marca_producto: { marca: brand, logo: brandLogo(brand) },
      precio: { detalle: inventory.detailPrice, mayoreo: inventory.bronzePrice },
      imagenes: { imagen_01: { id: "imagen_01", img: image } },
      extradata: {
        upc: inventory.upc,
        stock: inventory.stock > 0,
        inventoryQuantity: inventory.stock,
        imagePending: !exactImage,
        wholesaleEnabled: inventory.bronzePrice > 0,
        wholesaleCategory: inventory.category,
      },
      fecha_agregado: "2026-08-31T00:00:00.000Z",
    } satisfies Product;
    return [enrichProduct(product)];
  });
}

export function isGenericProduct(product: CatalogProduct) {
  const inventory = getCurrentInventory(product.sku);
  return normalizeText(inventory?.brand || product.marca_producto?.marca || "") === "varios";
}

function cleanProductName(value: string) {
  return value
    .replace(/^accesorio tecnol[oó]gico\s+/i, "")
    .replace(/\s*\/\s*\/(?:\s*\/)*/g, " / ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

export function preferredProductName(product: CatalogProduct) {
  if (product.sku === "HO-10110") {
    return "Soporte universal HOCO Flying para bicicleta y motocicleta";
  }
  const validatedName = getValidatedEntry(product.sku)?.name || "";
  const inventoryName = getCurrentInventory(product.sku)?.description || "";
  const source =
    /(?:\/\s*){2,}/.test(validatedName) && inventoryName
      ? inventoryName
      : validatedName || inventoryName || product.producto;
  return cleanProductName(source);
}

export function preferredProductSlug(product: CatalogProduct) {
  const storedSlug = slugify(product.slug || "");
  const storedSkuSlug = slugify(product.sku || "");
  if (storedSlug && storedSkuSlug && storedSlug.endsWith(`-${storedSkuSlug}`)) {
    return storedSlug;
  }
  const validated = getValidatedEntry(product.sku)?.slug;
  if (validated) {
    const base = cleanProductSlug(preferredProductName(product));
    const skuSlug = slugify(product.sku || "");
    const validatedSlug = slugify(validated);
    const preservesCollisionSuffix =
      skuSlug && validatedSlug.endsWith(`-${skuSlug}`);
    return preservesCollisionSuffix ? `${base}-${skuSlug}` : base;
  }

  const sku = normalizeText(product.sku || "");
  const baseName = normalizeText(product.producto || product.slug || "producto");
  const withoutSku = sku
    ? baseName.replace(new RegExp(`(?:^|\\s)${sku.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|\\s)`, "g"), " ")
    : baseName;

  return cleanProductSlug(withoutSku, product.sku) || slugify(product.producto || "producto");
}

function categoryByKeywords(product: CatalogProduct) {
  const text = normalizeText(
    [
      product.producto,
      product.descripcion,
      product.Subcategorias,
      ...(product.categorias || []),
    ].join(" "),
  );

  if (/(carro|vehiculo|automovil|car charger|transmisor fm|dash|soporte.*car)/.test(text)) {
    return "Smart Drive";
  }
  if (/(outdoor|exterior|camping|resistente al agua|impermeable|rugged)/.test(text)) {
    return "Outdoor Pro";
  }
  if (/(bolso|mochila|maletin|organizador|travel|estuche de viaje)/.test(text)) {
    return "Travel & Carry";
  }
  if (/(vidrio|lamina|protector de pantalla|privacy|privacidad|screen protector)/.test(text)) {
    return "Screen Protection";
  }
  if (/(audif|auricular|parlante|bocina|speaker|microfono|audio|sound)/.test(text)) {
    return "Sound Essentials";
  }
  if (/(cargador|cable|power bank|bateria portatil|adaptador|energia|power|usb|lightning)/.test(text)) {
    return "Power & Charge";
  }
  return "Smart Tech";
}

export function officialCategory(product: CatalogProduct) {
  if (isGenericProduct(product)) return "Accesorios Genéricos";
  return getValidatedEntry(product.sku)?.category || categoryByKeywords(product);
}

export function categorySlug(category: string) {
  return OFFICIAL_CATEGORIES.find((item) => item.name === category)?.slug || slugify(category);
}

export function normalizeColor(value?: string) {
  if (!value) return "";
  const text = normalizeText(value);
  const aliases: Array<[RegExp, string]> = [
    [/(negro|black|carbon|grafito|space gray)/, "Negro"],
    [/(blanco|white|marfil|crema)/, "Blanco"],
    [/(rojo|red|carmesi|vino|burgundy)/, "Rojo"],
    [/(azul|blue|navy|celeste)/, "Azul"],
    [/(verde|green|olive|oliva|menta)/, "Verde"],
    [/(morado|purple|violeta|lila|lavanda)/, "Morado"],
    [/(rosado|rosa|pink|rose)/, "Rosado"],
    [/(gris|gray|grey|plata|silver)/, "Gris"],
    [/(dorado|gold|champagne)/, "Dorado"],
    [/(naranja|orange)/, "Naranja"],
    [/(amarillo|yellow)/, "Amarillo"],
    [/(transparente|clear|crystal)/, "Transparente"],
    [/(iridiscente|tornasol|multicolor)/, "Multicolor"],
  ];
  return aliases.find(([pattern]) => pattern.test(text))?.[1] || "";
}

export function productColor(product: CatalogProduct & { extradata?: { color?: string } }) {
  return (
    normalizeColor(product.extradata?.color) ||
    normalizeColor(`${product.producto} ${product.descripcion}`)
  );
}

export function enrichProduct<T extends CatalogProduct>(product: T) {
  // Firestore agrega marcas de tiempo de auditoría que Next.js no puede
  // serializar directamente desde getStaticProps/getServerSideProps.
  const serializableProduct = Object.fromEntries(
    Object.entries(product).filter(
      ([key]) => key !== "createdAt" && key !== "updatedAt",
    ),
  ) as T;
  const category = isInternalCatalogProduct(product)
    ? String(product.categorias?.[0] || "Merchandising")
    : officialCategory(product);
  const inventory = getCurrentInventory(product.sku);
  const brand = canonicalBrandName(
    inventory?.brand || product.marca_producto?.marca,
  );
  const displayBrand = isGenericProduct(product) ? "Genérico" : brand;
  return {
    ...serializableProduct,
    producto: preferredProductName(product),
    slug: preferredProductSlug(product),
    categorias: [category],
    Subcategorias:
      getValidatedEntry(product.sku)?.subcategory ||
      inventory?.subcategory ||
      product.Subcategorias ||
      "",
    marca_producto: {
      ...(product.marca_producto || {}),
      marca: displayBrand,
      logo: isGenericProduct(product) ? "" : brandLogo(brand),
    },
    precio: {
      ...(product.precio || {}),
      detalle:
        inventory ? inventory.detailPrice : product.precio?.detalle || 0,
      mayoreo:
        inventory ? inventory.bronzePrice : product.precio?.mayoreo || 0,
    },
    extradata: {
      ...(product.extradata || {}),
      upc: inventory?.upc || product.extradata?.upc || "",
      stock: inventory ? inventory.stock > 0 : product.extradata?.stock,
      inventoryQuantity: inventory?.stock ?? product.extradata?.inventoryQuantity,
      wholesaleEnabled: inventory
        ? inventory.stock > 0 && inventory.bronzePrice > 0
        : product.extradata?.wholesaleEnabled,
    },
  };
}

function completenessScore(product: Product) {
  return 12 - productQualityIssues(product).length;
}

export type ProductQualityIssue =
  | "sku"
  | "upc"
  | "nombre"
  | "slug"
  | "descripcion"
  | "categoria"
  | "marca"
  | "precio"
  | "imagen";

function usableImageUrls(product: Product) {
  return Object.values(product.imagenes || {})
    .map((image) => image?.img?.trim())
    .filter((url): url is string =>
      Boolean(
        url &&
          !/default-product|placeholder|sin-imagen|brand\/isologo/i.test(url) &&
          (/^https?:\/\//i.test(url) || url.startsWith("/")),
      ),
    );
}

export function productQualityIssues(product: Product): ProductQualityIssue[] {
  const issues: ProductQualityIssue[] = [];
  if (!String(product.sku || "").trim()) issues.push("sku");
  if (!String(product.extradata?.upc || "").trim()) issues.push("upc");
  if (!String(product.producto || "").trim()) issues.push("nombre");
  if (!String(product.slug || "").trim()) issues.push("slug");
  if (String(product.descripcion || "").trim().length < 20) issues.push("descripcion");
  if (!Array.isArray(product.categorias) || !product.categorias.some(Boolean)) issues.push("categoria");
  if (!String(product.marca_producto?.marca || "").trim()) issues.push("marca");
  if (!(Number(product.precio?.detalle) > 0)) issues.push("precio");
  if (!usableImageUrls(product).length) issues.push("imagen");
  return issues;
}

export function isPublicProduct(product: Product) {
  return productBlockingIssues(product).length === 0 && !isInternalCatalogProduct(product);
}

/** Operational packaging, store displays and explicitly non-sellable SKUs stay in the CRUD only. */
export function isInternalCatalogProduct(product: CatalogProduct) {
  const inventory = getCurrentInventory(product.sku);
  const category = normalizeText(inventory?.category || product.categorias?.[0] || "");
  const subcategory = normalizeText(inventory?.subcategory || product.Subcategorias || "");
  const sku = normalizeText(inventory?.sku || product.sku || "");
  const excludedSkus = new Set([
    "mipa109pcmjt011",
    "ipadpro105myjk976np",
    "mipp129csrsss001",
    "mipp105pcmjt011",
    "mipp11csrsss221",
  ]);
  return (
    excludedSkus.has(sku) ||
    sku.startsWith("em-") ||
    category.startsWith("empaque ") ||
    category === "empaque" ||
    category === "merchandising" ||
    (category.includes("merchandising") && subcategory.includes("display"))
  );
}

/** UPC and photography remain visible quality tasks, but do not hide a priced SKU. */
export function productBlockingIssues(product: Product) {
  return productQualityIssues(product).filter(
    (issue) => issue !== "imagen" && issue !== "upc" && issue !== "descripcion",
  );
}

export function deduplicateProducts<T extends Product>(products: T[]) {
  const bySku = new Map<string, T>();
  for (const product of products) {
    const key = normalizeText(product.sku || "") || product.id;
    const existing = bySku.get(key);
    if (!existing || completenessScore(product) > completenessScore(existing)) {
      bySku.set(key, product);
    }
  }
  // UPC is audited in the CRUD but is not a safe deduplication key: W35 contains
  // legitimate variants that share one UPC while keeping distinct SKUs.
  return [...bySku.values()];
}

export function publicCatalog<T extends Product>(products: T[]) {
  return deduplicateProducts(products).filter(isPublicProduct);
}
