import { Product } from "@/types/ProductTypes";
import validatedCatalog from "@/data/validated-web-catalog.json";

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
};

type ValidatedEntry = {
  name: string;
  slug: string;
  brand: string;
  category: string;
  subcategory: string;
};

const records = validatedCatalog.records as Record<string, ValidatedEntry>;

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

export function preferredProductName(product: CatalogProduct) {
  if (product.sku === "HO-10110") {
    return "Soporte universal HOCO Flying para bicicleta y motocicleta";
  }
  return getValidatedEntry(product.sku)?.name || product.producto;
}

export function preferredProductSlug(product: CatalogProduct) {
  const validated = getValidatedEntry(product.sku)?.slug;
  if (validated) {
    const source =
      product.sku === "HO-10110"
        ? "soporte-universal-hoco-flying-para-bicicleta-y-motocicleta"
        : validated;
    return cleanProductSlug(source);
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
  return {
    ...product,
    producto: preferredProductName(product),
    slug: preferredProductSlug(product),
    categorias: [category],
    Subcategorias:
      getValidatedEntry(product.sku)?.subcategory || product.Subcategorias || "",
  };
}
