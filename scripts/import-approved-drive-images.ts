import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../src/lib/firebaseAdmin";
import approvedImages from "../src/data/approved-product-images.json";

type InventoryRecord = {
  sku: string;
  upc: string;
  stock: number;
  bronzePrice: number;
  detailPrice: number;
  category: string;
  subcategory: string;
  brand: string;
  description: string;
};

type PendingFile = { records: InventoryRecord[] };

const apply = process.argv.includes("--apply");
const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;
const pendingPath = resolve("output/catalog-w34-review/current-catalog-w34.pending.json");
const verificationPath = resolve("output/catalog-w34-review/drive-image-visual-verification.json");

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function isPlaceholder(value: unknown) {
  const image = String(value || "").trim();
  return !image || /default-product|placeholder|sin-imagen/i.test(image);
}

async function main() {
  if (!collectionName) throw new Error("NEXT_PUBLIC_DATABASE_NAME no está configurada.");
  if (!existsSync(pendingPath) || !existsSync(verificationPath)) {
    throw new Error("Faltan los reportes W34 o la verificación visual de Drive.");
  }

  const pending = JSON.parse(readFileSync(pendingPath, "utf8")) as PendingFile;
  const verification = JSON.parse(readFileSync(verificationPath, "utf8")) as {
    results: Array<{ sku: string; classification: string }>;
  };
  const visuallyApproved = new Set(
    verification.results
      .filter((entry) => entry.classification === "primary")
      .map((entry) => entry.sku),
  );
  const inventory = new Map(pending.records.map((record) => [record.sku, record]));
  const targets = Object.entries(approvedImages).filter(([sku]) => visuallyApproved.has(sku));

  const admin = getFirebaseAdmin();
  if (!admin) throw new Error("Firebase Admin no está configurado.");
  const collection = admin.db.collection(collectionName);
  const summary = { created: 0, updatedImage: 0, keptExistingImage: 0, skipped: 0 };

  for (const [sku, imagePath] of targets) {
    const record = inventory.get(sku);
    const assetPath = resolve("public", imagePath.replace(/^\//, ""));
    if (!record || record.stock <= 0 || !record.upc || record.detailPrice <= 0 || !existsSync(assetPath)) {
      summary.skipped += 1;
      console.log(`SKIP ${sku}: inventario o activo incompleto.`);
      continue;
    }

    const snapshot = await collection.where("sku", "==", sku).limit(2).get();
    if (!snapshot.empty) {
      const document = snapshot.docs[0];
      const current = document.data();
      const currentImage = current.imagenes?.imagen_01?.img;
      if (!isPlaceholder(currentImage)) {
        summary.keptExistingImage += 1;
        console.log(`KEEP ${sku}: ya posee una imagen válida.`);
        continue;
      }
      if (apply) {
        await document.ref.update({
          "imagenes.imagen_01": { id: "imagen_01", img: imagePath },
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      summary.updatedImage += 1;
      console.log(`${apply ? "UPDATE" : "WOULD UPDATE"} ${sku}: ${imagePath}`);
      continue;
    }

    const product = {
      sku,
      producto: record.description.trim(),
      slug: slugify(record.description),
      descripcion: record.description.trim(),
      categorias: [record.category.trim()],
      Subcategorias: record.subcategory.trim(),
      marca_producto: { marca: record.brand.trim(), logo: "" },
      precio: { detalle: record.detailPrice, mayoreo: record.bronzePrice },
      imagenes: { imagen_01: { id: "imagen_01", img: imagePath } },
      extradata: { upc: record.upc.trim(), stock: true },
      fecha_agregado: new Date().toISOString(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (apply) await collection.add(product);
    summary.created += 1;
    console.log(`${apply ? "CREATE" : "WOULD CREATE"} ${sku}: ${record.description}`);
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", targets: targets.length, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
