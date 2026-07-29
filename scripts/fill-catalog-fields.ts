import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../src/database/Config";
import currentCatalog from "../src/data/current-catalog-w31.json";
import validatedCatalog from "../src/data/validated-web-catalog.json";
import {
  brandLogo,
  canonicalBrandName,
  getBrandAsset,
} from "../src/lib/brands";
import {
  normalizeColor,
  officialCategory,
} from "../src/lib/catalog";

type ProductRecord = Record<string, any>;

const shouldApply = process.argv.includes("--apply");
const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;

if (!collectionName) {
  throw new Error("NEXT_PUBLIC_DATABASE_NAME is required");
}

const inventoryBySku = new Map(
  currentCatalog.records.map((record) => [record.sku.trim(), record]),
);
const validatedBySku = validatedCatalog.records as Record<
  string,
  {
    name: string;
    slug: string;
    brand: string;
    category: string;
    subcategory: string;
  }
>;

const isBlank = (value: unknown) =>
  value == null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as object).length === 0);

function inferColor(row: ProductRecord) {
  return normalizeColor(
    [
      row.producto,
      row.descripcion,
      row.Subcategorias,
      row.extradata?.modelId,
    ].join(" "),
  );
}

function uniqueTags(values: Array<string | undefined>) {
  return [
    ...new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ];
}

function buildUpdates(row: ProductRecord) {
  const sku = String(row.sku || "").trim();
  const inventory = inventoryBySku.get(sku);
  const validated = validatedBySku[sku];
  const brand = canonicalBrandName(
    inventory?.brand || validated?.brand || row.marca_producto?.marca,
  );
  const logo = brandLogo(brand);
  const brandAsset = getBrandAsset(brand);
  const category = officialCategory(row as any);
  const subcategory =
    validated?.subcategory || inventory?.subcategory || row.Subcategorias || "";
  const color = inferColor(row);
  const updates: Record<string, unknown> = {};

  if (isBlank(row.producto) && inventory?.description) {
    updates.producto = inventory.description;
  }

  const nextBrand = {
    ...(row.marca_producto || {}),
    marca: brand,
    logo,
  };
  if (
    brand &&
    (row.marca_producto?.marca !== brand ||
      (logo && row.marca_producto?.logo !== logo))
  ) {
    updates.marca_producto = nextBrand;
  }

  if (isBlank(row.Subcategorias) && subcategory) {
    updates.Subcategorias = subcategory;
  }

  if (isBlank(row.banner) && brandAsset) {
    updates.banner = {
      image_banner: brandAsset.logo,
      color: brandAsset.accent,
    };
  }

  if (category && JSON.stringify(row.categorias) !== JSON.stringify([category])) {
    updates.categorias = [category];
  }

  if (
    !(Number(row.precio?.detalle) > 0) &&
    Number(inventory?.detailPrice) > 0
  ) {
    updates.precio = {
      ...(row.precio || {}),
      detalle: inventory?.detailPrice,
    };
  }

  const nextExtra = { ...(row.extradata || {}) };
  let extraChanged = false;

  if (inventory && nextExtra.stock !== (inventory.stock > 0)) {
    nextExtra.stock = inventory.stock > 0;
    extraChanged = true;
  }
  if (isBlank(nextExtra.upc) && inventory?.upc) {
    nextExtra.upc = inventory.upc;
    extraChanged = true;
  }
  if (isBlank(nextExtra.color) && color) {
    nextExtra.color = color;
    extraChanged = true;
  }
  if (isBlank(nextExtra.tags)) {
    const tags = uniqueTags([brand, category, subcategory, color]);
    if (tags.length) {
      nextExtra.tags = tags;
      extraChanged = true;
    }
  }
  if (isBlank(nextExtra.especificaciones)) {
    const specifications = Object.fromEntries(
      [
        ["Marca", brand],
        ["Categoría", category],
        ["Subcategoría", subcategory],
        ["SKU", sku],
        ["UPC", nextExtra.upc || inventory?.upc || ""],
        ["Color", nextExtra.color || color],
      ].filter(([, value]) => Boolean(value)),
    );
    if (Object.keys(specifications).length) {
      nextExtra.especificaciones = specifications;
      extraChanged = true;
    }
  }
  if (extraChanged) {
    updates.extradata = nextExtra;
  }

  return updates;
}

async function main() {
  const snapshot = await getDocs(collection(db, collectionName));
  const candidates = snapshot.docs
    .map((document) => {
      const data = document.data() as ProductRecord;
      return {
        id: document.id,
        sku: String(data.sku || "").trim(),
        updates: buildUpdates(data),
      };
    })
    .filter((candidate) => Object.keys(candidate.updates).length > 0);

  const changedFields: Record<string, number> = {};
  for (const candidate of candidates) {
    for (const field of Object.keys(candidate.updates)) {
      changedFields[field] = (changedFields[field] || 0) + 1;
    }
  }

  const report = {
    mode: shouldApply ? "apply" : "dry-run",
    documentsReviewed: snapshot.size,
    documentsToUpdate: candidates.length,
    changedFields,
    unmatchedInventory: snapshot.docs.filter(
      (document) =>
        !inventoryBySku.has(String(document.data().sku || "").trim()),
    ).length,
    stillRequiresManualAssets: {
      images: snapshot.docs.filter((document) => {
        const images = document.data().imagenes || {};
        return !Object.values(images).some((image: any) => image?.img);
      }).length,
      wholesalePrice: snapshot.docs.filter(
        (document) => !(Number(document.data().precio?.mayoreo) > 0),
      ).length,
    },
  };

  if (shouldApply) {
    const backupDirectory = join(process.cwd(), "docs", "backups");
    mkdirSync(backupDirectory, { recursive: true });
    const backupPath = join(
      backupDirectory,
      `catalog-before-field-fill-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
    );
    writeFileSync(
      backupPath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          collection: collectionName,
          documents: snapshot.docs.map((document) => ({
            id: document.id,
            data: document.data(),
          })),
        },
        null,
        2,
      ),
      "utf8",
    );
    Object.assign(report, { backupPath });

    for (let start = 0; start < candidates.length; start += 400) {
      const batch = writeBatch(db);
      for (const candidate of candidates.slice(start, start + 400)) {
        batch.update(
          doc(db, collectionName, candidate.id),
          candidate.updates as any,
        );
      }
      await batch.commit();
    }
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
