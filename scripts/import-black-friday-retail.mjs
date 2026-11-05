import fs from "node:fs";
import path from "node:path";

const source = process.argv[2];
if (!source) throw new Error("Uso: node scripts/import-black-friday-retail.mjs <archivo.html>");

const html = fs.readFileSync(source, "utf8");
const decode = (value) => value
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const number = (value) => Number(decode(value).replace(/[^0-9.-]/g, "")) || 0;
const attr = (attrs, name) => {
  const match = attrs.match(new RegExp(`\\b${name}="([^"]*)"`, "i"));
  return match ? decode(match[1]) : "";
};

const offers = {};
const rows = [...html.matchAll(/<tr\s+class="item"([^>]*)>([\s\S]*?)<\/tr>/gi)];
for (const [, attrs, body] of rows) {
  const cells = [...body.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => decode(match[1]));
  if (cells.length < 8) continue;
  const sku = cells[0].trim().toUpperCase();
  if (!sku) continue;
  const entry = {
    sku,
    description: cells[1],
    category: attr(attrs, "data-cat"),
    brand: attr(attrs, "data-brand"),
    campaignLabel: attr(attrs, "data-lbl"),
    plazaStock: number(cells[3]),
    vieraStock: number(cells[4]),
    originalPrice: number(cells[5]),
    promotionalPrice: number(cells[6]),
    discountPercent: Math.abs(number(cells[7])),
    promotionalValue: number(cells[8]),
  };
  if (!entry.originalPrice || !entry.promotionalPrice || !entry.discountPercent) {
    throw new Error(`Oferta incompleta para ${sku}`);
  }
  if (offers[sku] && JSON.stringify(offers[sku]) !== JSON.stringify(entry)) {
    throw new Error(`SKU duplicado con valores distintos: ${sku}`);
  }
  offers[sku] = entry;
}

const ordered = Object.fromEntries(Object.entries(offers).sort(([a], [b]) => a.localeCompare(b)));
const target = path.resolve("src/data/black-friday-retail-2026.json");
fs.writeFileSync(target, `${JSON.stringify(ordered, null, 2)}\n`);
console.log(`Ofertas importadas: ${Object.keys(ordered).length}`);
console.log(`Archivo: ${target}`);
