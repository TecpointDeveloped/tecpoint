import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "output/catalog-w40-review/source-w40.json");
const previousPath = path.join(root, "src/data/current-catalog-w35.json");
const catalogPath = path.join(root, "src/data/current-catalog-w40.json");
const reportPath = path.join(root, "output/catalog-w40-review/import-summary.json");
const sourceRows = JSON.parse(await readFile(sourcePath, "utf8"));
const previous = JSON.parse(await readFile(previousPath, "utf8"));
const previousBySku = new Map(previous.records.map((record) => [String(record.sku || "").trim().toLowerCase(), record]));

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const slugify = (value) => clean(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/&/g, " y ")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .replace(/-{2,}/g, "-");
const cleanName = (value, sku) => clean(value)
  .replace(new RegExp(`^${clean(sku).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-:]?\\s*`, "i"), "")
  .replace(/^\([^)]{1,18}\)\s*[-:]?\s*/, "")
  .trim() || clean(value) || `Producto TECPOINT ${clean(sku)}`;

const prepared = sourceRows.map((row) => {
  const sku = clean(row.SKU);
  const prior = previousBySku.get(sku.toLowerCase());
  const description = prior?.description || cleanName(row.Descripcion, sku);
  return { row, sku, prior, description, baseSlug: prior?.slug || slugify(description) || slugify(`producto-${sku}`) };
});
const newSlugCounts = new Map();
prepared.filter(({ prior }) => !prior).forEach(({ baseSlug }) => newSlugCounts.set(baseSlug, (newSlugCounts.get(baseSlug) || 0) + 1));

const records = prepared.map(({ row, sku, prior, description, baseSlug }) => ({
  sourceRow: number(row.sourceRow),
  brand: clean(row.Marca) || prior?.brand || "TECPOINT",
  category: clean(row.Categoria) || prior?.category || "Sin categoría",
  subcategory: clean(row["Sub Categoria"]) || prior?.subcategory || "",
  upc: clean(row.UPC).replace(/\.0$/, "") || prior?.upc || "",
  sku,
  description,
  slug: prior?.slug || ((newSlugCounts.get(baseSlug) || 0) > 1 ? `${baseSlug}-${slugify(sku)}` : baseSlug),
  stock: number(row.Existencia),
  inTransit: 0,
  lostSales: 0,
  averageSales: 0,
  purchasedQuantity: 0,
  lastPurchaseExcelDate: 0,
  bronzePrice: number(row["Precio Bronce"]),
  detailPrice: number(row["Precio Detalle"]),
  sourceUrl: clean(row.URL) || prior?.sourceUrl || "",
}));

const sourceSkuCounts = new Map();
records.forEach((record) => sourceSkuCounts.set(record.sku.toLowerCase(), (sourceSkuCounts.get(record.sku.toLowerCase()) || 0) + 1));
const duplicateSkus = [...sourceSkuCounts].filter(([sku, count]) => sku && count > 1).map(([sku, count]) => ({ sku, count }));
const currentBySku = new Map(records.map((record) => [record.sku.toLowerCase(), record]));
const priceChanges = previous.records.flatMap((record) => {
  const current = currentBySku.get(String(record.sku || "").trim().toLowerCase());
  if (!current || (Number(record.detailPrice) === current.detailPrice && Number(record.bronzePrice) === current.bronzePrice)) return [];
  return [{ sku: record.sku, previousDetail: Number(record.detailPrice), currentDetail: current.detailPrice, previousBronze: Number(record.bronzePrice), currentBronze: current.bronzePrice }];
});
const summary = {
  source: "ITEMS ELIEZER W40.xlsx",
  generatedAt: new Date().toISOString(),
  total: records.length,
  inStock: records.filter((record) => record.stock > 0).length,
  publicWithPrice: records.filter((record) => record.detailPrice > 0).length,
  missingDetailPrice: records.filter((record) => !(record.detailPrice > 0)).length,
  missingBronzePrice: records.filter((record) => !(record.bronzePrice > 0)).length,
  missingSku: records.filter((record) => !record.sku).length,
  missingUpc: records.filter((record) => !record.upc).length,
  duplicateSkus,
  matchedPrevious: records.filter((record) => previousBySku.has(record.sku.toLowerCase())).length,
  newSkus: records.filter((record) => !previousBySku.has(record.sku.toLowerCase())).length,
  removedSinceW35: previous.records.filter((record) => !currentBySku.has(String(record.sku || "").trim().toLowerCase())).length,
  priceChanges: priceChanges.length,
};

await mkdir(path.dirname(catalogPath), { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(catalogPath, `${JSON.stringify({ source: summary.source, generatedAt: summary.generatedAt, records }, null, 2)}\n`, "utf8");
await writeFile(reportPath, `${JSON.stringify({ ...summary, changedPrices: priceChanges }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
