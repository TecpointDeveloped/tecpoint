import fs from "node:fs";
import path from "node:path";

const source = process.argv[2];
if (!source) {
  throw new Error("Uso: node scripts/import-black-friday-wholesale.mjs <archivo.html>");
}

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
  const cells = [...body.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
    .map((match) => decode(match[1]));
  if (cells.length < 9) continue;

  const sku = cells[0].trim().toUpperCase();
  const entry = {
    name: cells[1],
    category: attr(attrs, "data-cat"),
    brand: attr(attrs, "data-brand"),
    level: attr(attrs, "data-lbl"),
    stock: number(cells[3]),
    originalPrice: number(cells[4]),
    finalPrice: number(cells[5]),
    discountPercent: Math.abs(number(cells[6])),
  };

  if (!sku || !entry.name || !entry.category || !entry.brand || !entry.level || !entry.stock || !entry.originalPrice || !entry.finalPrice) {
    throw new Error(`Oferta incompleta para ${sku || "SKU desconocido"}`);
  }
  if (entry.finalPrice >= entry.originalPrice || entry.discountPercent <= 0) {
    throw new Error(`Descuento inválido para ${sku}`);
  }
  if (offers[sku] && JSON.stringify(offers[sku]) !== JSON.stringify(entry)) {
    throw new Error(`SKU duplicado con valores distintos: ${sku}`);
  }
  offers[sku] = entry;
}

const ordered = Object.fromEntries(
  Object.entries(offers).sort(([left], [right]) => left.localeCompare(right)),
);
const target = path.resolve("src/data/black-november-2026.json");
fs.writeFileSync(target, `${JSON.stringify(ordered, null, 2)}\n`);
console.log(`Filas leídas: ${rows.length}`);
console.log(`Ofertas importadas: ${Object.keys(ordered).length}`);
console.log(`Archivo: ${target}`);
