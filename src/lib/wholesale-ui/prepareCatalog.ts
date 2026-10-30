import media from './media.json';
import type { WholesaleProduct as SourceWholesaleProduct } from '@/lib/wholesaleCatalog';
import { cleanCategory } from './productPresentation';
import { normalizeDevices, reviewedDevices } from './wholesaleProductRules';
import type { WholesaleProduct } from './types';
const prefix = '/tecpoint-catalog-ui';
const columns = ['sku','name','brand','category','image','thumbnail','devices','classification','originalPrice','discountPercent','price','retailPrice','stock'];
export function prepareCatalog(products: SourceWholesaleProduct[]) {
  const rows = products.map(product => {
    const p: WholesaleProduct = {
      ...product,
      thumbnail: product.image,
      devices: [],
      classification: '',
      originalPrice: null,
      discountPercent: null,
      gallery: [],
      specifications: {},
    };
    const known = (media as Record<string, { original: string; image: string; thumbnail: string }>)[p.sku];
    // The current panel image wins when it differs from the delivered baseline.
    if (known && (!p.image || p.image === known.original || p.image === known.image)) {
      p.image = prefix + known.image;
      p.thumbnail = prefix + known.thumbnail;
    } else { p.thumbnail = p.thumbnail || p.image; }
    p.image ||= prefix + '/brand/isologo.svg'; p.thumbnail ||= p.image;
    p.category = cleanCategory(p.category || 'Otros', p.name, p.subcategory);
    p.devices = reviewedDevices(p.name, normalizeDevices(p.devices), p.category);
    return [p.sku, p.name, p.brand, p.category, p.image, p.thumbnail, p.devices.map(d => [d.manufacturer,d.model]), p.classification, p.originalPrice, p.discountPercent, p.price, p.retailPrice, p.stock];
  });
  return {columns,rows,details:[]};
}
