import {
  approvedCatalogProducts,
  isGenericProduct,
  isInternalCatalogProduct,
  publicCatalog,
} from "../src/lib/catalog";

const normalize = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const all = approvedCatalogProducts();
const publicProducts = publicCatalog(all);
const suspectBrand = /^(varios?|generico|generic|sin marca|n\/?a|na|no brand|unbranded)?$/;
const internalTerm = /(^|\b)(empaque|packaging|merchandising|material pop|display stand)(\b|$)/;

const suspectBrands = publicProducts.filter((product) =>
  suspectBrand.test(normalize(product.marca_producto?.marca || "")),
);
const suspectTerms = publicProducts.filter((product) =>
  internalTerm.test(
    normalize(
      [
        product.producto,
        product.descripcion,
        product.categorias?.join(" "),
        product.Subcategorias,
      ].join(" "),
    ),
  ),
);
const longNames = publicProducts.filter((product) => (product.producto || "").length > 120);

const report = {
  recordsInCrud: all.length,
  publicProducts: publicProducts.length,
  genericProductsPublic: publicProducts.filter(isGenericProduct).length,
  internalProductsPublic: publicProducts.filter(isInternalCatalogProduct).length,
  suspectBrandCount: suspectBrands.length,
  suspectTermCount: suspectTerms.length,
  longNameCount: longNames.length,
  missingBrandInCrud: all.filter(
    (product) => !String(product.marca_producto?.marca || "").trim(),
  ).length,
  suspects: {
    brands: suspectBrands.map(({ sku, producto, marca_producto }) => ({
      sku,
      producto,
      marca: marca_producto?.marca,
    })),
    internalTerms: suspectTerms.map(
      ({ sku, producto, categorias, Subcategorias }) => ({
        sku,
        producto,
        categorias,
        subcategoria: Subcategorias,
      }),
    ),
    longNames: longNames.map(({ sku, producto }) => ({
      sku,
      characters: producto.length,
      producto,
    })),
  },
};

console.log(JSON.stringify(report, null, 2));

if (
  report.genericProductsPublic ||
  report.internalProductsPublic ||
  report.suspectBrandCount ||
  report.suspectTermCount
) {
  process.exitCode = 1;
}
