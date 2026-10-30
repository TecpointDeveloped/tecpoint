import type { WholesaleProduct } from './types';
import { titleFacts } from './productPresentation';
export type PackedCatalog = { columns: string[]; rows: unknown[][]; details: string[] };
type UnknownRecord = Record<string, unknown>;
const asText = (value: unknown) => typeof value === 'string' ? value : '';
const asNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null;
const asStringRecord = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
};
export function decodeCatalog(data: PackedCatalog): WholesaleProduct[] {
  if (!Array.isArray(data.rows) || !Array.isArray(data.columns)) throw Error('Catálogo inválido');
  return data.rows.map(row => {
    const p = Object.fromEntries(data.columns.map((key,i) => [key,row[i]])) as UnknownRecord;
    const thumbnail = asText(p.thumbnail) || asText(p.image);
    const devices = Array.isArray(p.devices) ? p.devices.flatMap(device => {
      if (!Array.isArray(device) || typeof device[0] !== 'string' || typeof device[1] !== 'string') return [];
      return [{ manufacturer: device[0], model: device[1] }];
    }) : [];
    const sku = asText(p.sku);
    return {
      sku,
      name: asText(p.name),
      brand: asText(p.brand),
      category: asText(p.category),
      image: asText(p.image),
      thumbnail,
      thumbnailLarge: thumbnail.endsWith('-320.webp') ? thumbnail.replace('-320.webp','-640.webp') : thumbnail,
      detailFile: '/api/wholesale-catalog?search=' + encodeURIComponent(sku) + '&limit=60',
      devices,
      classification: asText(p.classification),
      originalPrice: asNumber(p.originalPrice),
      discountPercent: asNumber(p.discountPercent),
      price: asNumber(p.price),
      retailPrice: asNumber(p.retailPrice),
      dozenPrice: null,
      description: '',
      specifications: {},
      subcategory: '',
      upc: '',
      gallery: [],
      stock: Math.max(0, asNumber(p.stock) ?? 0),
    };
  });
}
const details = new Map<string,Promise<UnknownRecord>>();
export async function getProductDetail(product: WholesaleProduct): Promise<WholesaleProduct> {
  if (!product.detailFile) return product;
  const url = product.detailFile;
  if (!details.has(url)) details.set(url, fetch(url).then(async response => {
    if (!response.ok) throw Error('No se pudo cargar la ficha');
    const data: unknown = await response.json();
    const products = data && typeof data === 'object' && 'products' in data && Array.isArray((data as { products?: unknown }).products)
      ? (data as { products: unknown[] }).products
      : [];
    const detail = products.find((entry): entry is UnknownRecord => Boolean(entry && typeof entry === 'object' && 'sku' in entry && entry.sku === product.sku));
    if (!detail) throw Error('Producto no encontrado en el catálogo actual');
    return detail;
  }).catch(error => {details.delete(url); throw error;}));
  const detail = await details.get(url)!;
  const rawGallery: unknown[] = [product.image, ...(Array.isArray(detail.gallery) ? detail.gallery : [])];
  const gallery = [...new Set(rawGallery.filter((path): path is string => typeof path === 'string' && !path.includes('isologo') && ((path.startsWith('/') && !path.startsWith('//')) || path.startsWith('https://'))))];
  return {...product,description:asText(detail.description),specifications:{...titleFacts(asText(detail.name) || product.name),...asStringRecord(detail.specifications)},subcategory:asText(detail.subcategory),upc:asText(detail.upc),gallery};
}
export const money = (value:number) => new Intl.NumberFormat('es-HN',{style:'currency',currency:'HNL',minimumFractionDigits:2}).format(value);
