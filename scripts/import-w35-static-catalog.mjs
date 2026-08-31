import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "output/catalog-w35-review/source-w35.json");
const catalogPath = path.join(root, "src/data/current-catalog-w35.json");
const reportPath = path.join(root, "output/catalog-w35-review/import-summary.json");
const sourceRows = JSON.parse(await readFile(sourcePath, "utf8"));

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

const baseSlugs = new Map();
const prepared = sourceRows.map((row) => {
  const sku = clean(row.SKU);
  const description = cleanName(row.Descripcion, sku);
  const baseSlug = slugify(description) || slugify(`producto-${sku}`);
  baseSlugs.set(baseSlug, (baseSlugs.get(baseSlug) || 0) + 1);
  return { row, sku, description, baseSlug };
});

const records = prepared.map(({ row, sku, description, baseSlug }) => ({
  sourceRow: number(row.sourceRow),
  brand: clean(row.Marca) || "TECPOINT",
  category: clean(row.Categoria) || "Sin categoría",
  subcategory: clean(row["Sub Categoria"]),
  upc: clean(row.UPC).replace(/\.0$/, ""),
  sku,
  description,
  slug: (baseSlugs.get(baseSlug) || 0) > 1 ? `${baseSlug}-${slugify(sku)}` : baseSlug,
  stock: number(row.Existencia),
  inTransit: number(row["Cantidad en transito"]),
  lostSales: number(row["Venta Perdida"]),
  averageSales: number(row["Venta PM"]),
  purchasedQuantity: number(row["Cantidad Comprada"]),
  lastPurchaseExcelDate: number(row["Fecha de ultima compra"]),
  bronzePrice: number(row["Precio Bronce"]),
  detailPrice: number(row["Precio Detalle"]),
  sourceUrl: clean(row.URL),
}));

const summary = {
  source: "items eliezer w35.xlsx",
  generatedAt: new Date().toISOString(),
  total: records.length,
  publicWithPrice: records.filter((record) => record.detailPrice > 0).length,
  inStock: records.filter((record) => record.stock > 0).length,
  missingDetailPrice: records.filter((record) => !(record.detailPrice > 0)).length,
  missingUpc: records.filter((record) => !record.upc).length,
  duplicateSku: records.length - new Set(records.map((record) => record.sku.toLowerCase())).size,
};

await mkdir(path.dirname(catalogPath), { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(catalogPath, `${JSON.stringify({ source: summary.source, generatedAt: summary.generatedAt, records }, null, 2)}\n`, "utf8");
await writeFile(reportPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
