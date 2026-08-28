import pendingW34 from "@/data/pending-w34-products.json";
import { brandLogo, canonicalBrandName } from "@/lib/brands";
import type { Product } from "@/types/ProductTypes";

export function pendingW34DraftProducts(): Product[] {
  return pendingW34.records.map((record) => {
    const brand = canonicalBrandName(record.brand);
    return {
      id: `w34-draft-${record.sku}`,
      sku: record.sku,
      producto: record.description,
      slug: record.slug,
      descripcion: record.description,
      categorias: [record.category],
      Subcategorias: record.subcategory,
      marca_producto: { marca: brand, logo: brandLogo(brand) },
      precio: { detalle: record.detailPrice, mayoreo: record.bronzePrice },
      imagenes: {},
      extradata: {
        upc: record.upc,
        stock: record.stock > 0,
        tags: [record.category, record.subcategory, brand],
        searchAliases: record.searchAliases,
        wholesaleEnabled: record.bronzePrice > 0,
        wholesaleCategory: record.category,
      },
      fecha_agregado: null,
    };
  });
}
