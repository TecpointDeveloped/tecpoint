import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const comparison = JSON.parse(fs.readFileSync(path.join(root, "output/catalog-w34-review/w34-comparison.json"), "utf8"));
const approved = JSON.parse(fs.readFileSync(path.join(root, "src/data/approved-product-images.json"), "utf8"));
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const slugify = (value) => normalize(value).replace(/&/g, " y ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
const candidates = comparison.candidateAdditions;
const slugCounts = new Map();
for (const item of candidates) {
  const base = slugify(item.description) || `producto-${slugify(item.sku)}`;
  slugCounts.set(base, (slugCounts.get(base) || 0) + 1);
}

function aliases(item) {
  const text = normalize(`${item.description} ${item.category} ${item.subcategory}`);
  const values = new Set([item.brand, item.category, item.subcategory, item.sku, item.upc]);
  const groups = [
    [/carg|charger|adaptador de pared/, ["cargador", "cabeza de carga", "cubo", "cubito", "taco", "bloque de carga"]],
    [/cable|usb|lightning|tipo c|type c/, ["cable", "cable de carga", "usb c", "tipo c"]],
    [/audif|earbud|headset|auricular/, ["audífonos", "auriculares", "earbuds", "audífonos inalámbricos"]],
    [/funda|case|cobertor|cover/, ["funda", "forro", "case", "cobertor"]],
    [/vidrio|lamina|film|protector/, ["protector de pantalla", "vidrio templado", "lámina", "film"]],
    [/bateria|power ?bank/, ["batería portátil", "power bank", "powerbank"]],
    [/reloj|watch/, ["reloj inteligente", "smartwatch", "smart watch"]],
    [/carro|vehiculo|auto/, ["carro", "vehículo", "automóvil"]],
  ];
  for (const [pattern, terms] of groups) if (pattern.test(text)) terms.forEach((term) => values.add(term));
  return [...values].map((value) => String(value || "").trim()).filter(Boolean);
}

const records = candidates.filter((item) => !approved[item.sku]).map((item) => {
  const base = slugify(item.description) || `producto-${slugify(item.sku)}`;
  return { ...item, slug: slugCounts.get(base) > 1 ? `${base}-${slugify(item.sku)}` : base, searchAliases: aliases(item) };
});
if (records.length !== 411) throw new Error(`Se esperaban 411 borradores y se generaron ${records.length}.`);
const output = path.join(root, "src/data/pending-w34-products.json");
fs.writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output, records: records.length }));
