import { Product } from "@/types/ProductTypes";
import validatedCatalog from "@/data/validated-web-catalog.json";
import currentCatalog from "@/data/current-catalog-w31.json";

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
  [/\b(rock\s*space|rockspace|rok\s*space|rokspace)\b/g, " rock space rockspace "],
  [/\b(celular|telefono|movil|smartphone)\b/g, " celular telefono movil smartphone "],
  [/\b(audifono|audifonos|auricular|auriculares|headset|earbuds)\b/g, " audifono audifonos auricular auriculares headset earbuds "],
  [/\b(cargador|cargadores|charger|carga)\b/g, " cargador cargadores charger carga "],
  [/\b(lamina|laminas|vidrio|protector|proteccion|film)\b/g, " lamina laminas vidrio protector proteccion film "],
  [/\b(forro|funda|case|cobertor)\b/g, " forro funda case cobertor "],
  [/\b(bateria|powerbank|power bank)\b/g, " bateria powerbank power bank "],
  [/\b(reloj|smartwatch|watch)\b/g, " reloj smartwatch watch "],
  [/\b(carro|vehiculo|auto|automovil)\b/g, " carro vehiculo auto automovil "],
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
  const category = officialCategory(product);
  const inventory = getCurrentInventory(product.sku);
  return {
    ...product,
    producto: preferredProductName(product),
    slug: preferredProductSlug(product),
    categorias: [category],
    Subcategorias:
      getValidatedEntry(product.sku)?.subcategory || product.Subcategorias || "",
    precio: {
      ...(product.precio || {}),
      detalle:
        inventory ? inventory.detailPrice : product.precio?.detalle || 0,
    },
    extradata: {
      ...(product.extradata || {}),
      upc: inventory?.upc || product.extradata?.upc || "",
      stock: inventory ? inventory.stock > 0 : product.extradata?.stock,
    },
  };
}

function completenessScore(product: Product) {
  return [
    product.producto,
    product.descripcion,
    product.slug,
    product.marca_producto?.marca,
    product.imagenes && Object.keys(product.imagenes).length,
    Number(product.precio?.detalle) > 0,
  ].filter(Boolean).length;
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
  return [...bySku.values()];
}
