import { chmod, copyFile, mkdir, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const reportPath = path.join(root, "output/catalog-w34-review/drive-image-matches.json");
const inventoryPath = path.join(root, "output/catalog-w34-review/current-catalog-w34.pending.json");
const imageDir = path.join(root, "public/images/products");
const mapPath = path.join(root, "src/data/approved-product-images.json");
const catalogPath = path.join(root, "src/data/current-catalog-w34.json");

// These exact-SKU files were manually reviewed and do not meet the clean product-photo rule.
const excludedSkus = new Set(["EL-10208", "HG-15164", "PP-DVC38L", "HG-15289"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function extensionFor(title, contentType) {
  const sourceExtension = path.extname(title || "").toLowerCase();
  if (allowedExtensions.has(sourceExtension)) {
    return sourceExtension === ".jpeg" ? ".jpg" : sourceExtension;
  }
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  return ".jpg";
}

function hasImageSignature(buffer) {
  return (
    (buffer[0] === 0xff && buffer[1] === 0xd8) ||
    (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) ||
    (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP")
  );
}

function safeFileStem(sku) {
  return String(sku).trim().replace(/[^a-z0-9+._-]+/gi, "");
}

async function download(item) {
  const expectedExtension = extensionFor(item.primary.title, "");
  const expectedFileName = `${item.sku}${expectedExtension}`;
  const optimizedFileName = `${safeFileStem(item.sku)}.webp`;
  try {
    const optimized = await readFile(path.join(imageDir, optimizedFileName));
    if (hasImageSignature(optimized)) {
      return [item.sku, `/images/products/${optimizedFileName}`];
    }
  } catch {
    // No optimized local image exists yet.
  }
  try {
    const existing = await readFile(path.join(imageDir, expectedFileName));
    if (hasImageSignature(existing)) {
      return [item.sku, `/images/products/${expectedFileName}`];
    }
  } catch {
    // The file has not been imported yet.
  }
  const response = await fetch(`https://drive.google.com/uc?export=download&id=${item.primary.id}`);
  if (!response.ok) throw new Error(`${item.sku}: HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!hasImageSignature(buffer)) throw new Error(`${item.sku}: Drive did not return an image`);
  const extension = extensionFor(item.primary.title, contentType);
  const fileName = `${item.sku}${extension}`;
  await writeFile(path.join(imageDir, fileName), buffer);
  return [item.sku, `/images/products/${fileName}`];
}

async function optimize([sku, imageUrl]) {
  const sourcePath = path.join(root, "public", imageUrl);
  const targetName = `${safeFileStem(sku)}.webp`;
  const targetPath = path.join(imageDir, targetName);
  if (path.extname(sourcePath).toLowerCase() === ".webp") {
    if (sourcePath !== targetPath) await copyFile(sourcePath, targetPath);
    return [sku, `/images/products/${targetName}`];
  }
  const temporaryPath = path.join(imageDir, `${safeFileStem(sku)}.optimized.webp`);
  await sharp(sourcePath)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, effort: 4 })
    .toFile(temporaryPath);
  await chmod(targetPath, 0o666).catch(() => undefined);
  await rm(targetPath, { force: true });
  await rename(temporaryPath, targetPath);
  if (sourcePath !== targetPath) {
    await chmod(sourcePath, 0o666).catch(() => undefined);
    await unlink(sourcePath).catch(() => undefined);
  }
  return [sku, `/images/products/${targetName}`];
}

async function runPool(items, concurrency = 8) {
  const results = new Array(items.length);
  const failures = [];
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = await download(items[index]);
      } catch (error) {
        failures.push({
          sku: items[index].sku,
          id: items[index].primary.id,
          title: items[index].primary.title,
          url: items[index].primary.url,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      if ((index + 1) % 25 === 0 || index + 1 === items.length) {
        console.log(`Downloaded ${index + 1}/${items.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { results: results.filter(Boolean), failures };
}

const report = JSON.parse(await readFile(reportPath, "utf8"));
const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
const inventoryBySku = new Map(inventory.records.map((item) => [String(item.sku).trim(), item]));
const candidates = report.items.filter((item) => {
  const product = inventoryBySku.get(String(item.sku).trim());
  return (
    item.status === "probable-white-primary" &&
    !excludedSkus.has(item.sku) &&
    product &&
    String(product.upc || "").trim() &&
    Number(product.detailPrice) > 0 &&
    Number(product.stock) > 0
  );
});

await mkdir(imageDir, { recursive: true });
const { results: downloadedEntries, failures } = await runPool(candidates);
const entries = [];
for (const entry of downloadedEntries) entries.push(await optimize(entry));
entries.sort(([left], [right]) => left.localeCompare(right));
await writeFile(mapPath, `${JSON.stringify(Object.fromEntries(entries), null, 2)}\n`);
await writeFile(
  catalogPath,
  `${JSON.stringify({ source: inventory.source, generatedAt: inventory.generatedAt, records: inventory.records }, null, 2)}\n`,
);
await writeFile(
  path.join(root, "output/catalog-w34-review/drive-image-download-failures.json"),
  `${JSON.stringify(failures, null, 2)}\n`,
);
console.log(`Imported ${entries.length} complete W34 products with exact primary images.`);
console.log(`Connector fallback required for ${failures.length} restricted images.`);
