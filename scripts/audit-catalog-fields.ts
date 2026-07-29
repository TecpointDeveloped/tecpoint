import { collection, getDocs } from "firebase/firestore";
import { db } from "../src/database/Config";

type ProductRecord = Record<string, any>;

async function main() {
  const collectionName = process.env.NEXT_PUBLIC_DATABASE_NAME;
  if (!collectionName) {
    throw new Error("NEXT_PUBLIC_DATABASE_NAME is required");
  }

  const snapshot = await getDocs(collection(db, collectionName));
  const rows = snapshot.docs.map<ProductRecord>((document) => ({
    id: document.id,
    ...document.data(),
  }));

const isBlank = (value: unknown) =>
  value == null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as object).length === 0);

const topLevelFields = [
  "producto",
  "sku",
  "slug",
  "descripcion",
  "categorias",
  "Subcategorias",
  "imagenes",
  "marca_producto",
  "precio",
  "banner",
  "secciones",
  "extradata",
];

  const counts = Object.fromEntries(
    topLevelFields.map((field) => [
      field,
      rows.filter((row) => isBlank(row[field])).length,
    ]),
  );

  const nested = {
    marca: rows.filter((row) => isBlank(row.marca_producto?.marca)).length,
    logo: rows.filter((row) => isBlank(row.marca_producto?.logo)).length,
    precioDetalle: rows.filter((row) => !(Number(row.precio?.detalle) > 0)).length,
    precioMayoreo: rows.filter((row) => !(Number(row.precio?.mayoreo) > 0)).length,
    imagenPrincipal: rows.filter(
      (row) =>
        isBlank(row.imagenes?.imagen_01?.img) &&
        !Object.values(row.imagenes || {}).some(
          (image: any) => image?.img,
        ),
    ).length,
    upc: rows.filter((row) => isBlank(row.extradata?.upc)).length,
    color: rows.filter((row) => isBlank(row.extradata?.color)).length,
    tags: rows.filter((row) => isBlank(row.extradata?.tags)).length,
    especificaciones: rows.filter((row) =>
      isBlank(row.extradata?.especificaciones),
    ).length,
  };

  const brands = [
    ...new Set(
      rows
        .map((row) => String(row.marca_producto?.marca || "").trim())
        .filter(Boolean),
    ),
  ].sort((left, right) => left.localeCompare(right, "es"));

  console.log(
    JSON.stringify(
      {
        documents: rows.length,
        counts,
        nested,
        brands,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
