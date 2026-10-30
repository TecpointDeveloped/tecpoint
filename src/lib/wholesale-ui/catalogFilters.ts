import { normalizeDevice, normalizeDevices } from './wholesaleProductRules';
import type { WholesaleProduct } from './types';

export type Filters = { search?: string; brand?: string; category?: string; liquidation?: boolean; manufacturer?: string; model?: string; classification?: string; offers?: boolean };
export type SortOrder = 'recommended' | 'price-asc' | 'price-desc' | 'name';
const aliases: Record<string, string> = { funda: 'cobertor', fundas: 'cobertor', forro: 'cobertor', forros: 'cobertor', case: 'cobertor', cases: 'cobertor', cobertores: 'cobertor', vidrios: 'vidrio', glass: 'vidrio', cargadores: 'cargador', cables: 'cable', audifonos: 'audifono' };
const stopWords = new Set(['para', 'de', 'del', 'el', 'la', 'los', 'las', 'con', 'un', 'una', 'y']);
export function searchTokens(value: string) {
  return normalizeDevice(value).replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2').replace(/[^a-z0-9]+/g, ' ').split(' ').filter(t => t && !stopWords.has(t)).map(t => aliases[t] || t);
}
const searchCache = new WeakMap<WholesaleProduct, string[]>();
export function productFamily(p: WholesaleProduct) {
  const value = normalizeDevice(p.category + ' ' + p.name);
  return /cobertor|funda|case |forro/.test(value) ? 'covers' : /vidrio|proteccion.*pantalla|protector.*pantalla|nanopolimero/.test(value) ? 'glass' : 'other';
}
export function hasOffer(p: WholesaleProduct) { return p.price != null && p.originalPrice != null && p.originalPrice > p.price; }
export function matchesDevice(p: WholesaleProduct, manufacturer = '', model = '') {
  return p.devices.some(d => (!manufacturer || normalizeDevice(d.manufacturer) === normalizeDevice(manufacturer)) && (!model || normalizeDevice(d.model) === normalizeDevice(model)));
}
export function matchesSearch(p: WholesaleProduct, query: string) {
  const terms = searchTokens(query);
  if (!terms.length) return true;
  if (!searchCache.has(p)) {
    const identity = searchTokens(`${p.name} ${p.brand} ${p.sku} ${p.devices.map(d => `${d.manufacturer} ${d.model}`).join(' ')}`);
    // A legacy category such as "PROMOCION 15%" is not an iPhone 15 match.
    const labels = searchTokens(`${p.category} ${p.classification}`).filter(word => !/^\d+$/.test(word));
    searchCache.set(p, [...identity, ...labels]);
  }
  const words = searchCache.get(p)!;
  return terms.every(term => words.some(word => /^\d+$/.test(term) ? word === term : word.startsWith(term)));
}
export function filterWholesaleCatalog(products: WholesaleProduct[], filters: Filters) {
  return products.filter(p => {
    if (filters.brand && p.brand !== filters.brand) return false;
    if (filters.category === '__accessories') { if (!p.devices.length) return false; }
    else if (filters.category?.startsWith('__')) { if (productFamily(p) !== filters.category.slice(2)) return false; }
    else if (filters.category && p.category !== filters.category) return false;
    if (filters.liquidation && (p.stock > 2 || p.stock <= 0)) return false;
    if (filters.offers && !hasOffer(p)) return false;
    if (filters.classification && p.classification !== filters.classification) return false;
    if ((filters.manufacturer || filters.model) && !matchesDevice(p, filters.manufacturer, filters.model)) return false;
    return matchesSearch(p, filters.search || '');
  });
}
export function sortProducts(products: WholesaleProduct[], order: SortOrder, query = '') {
  return [...products].sort((a, b) => {
    if (order === 'price-asc') return (a.price ?? Infinity) - (b.price ?? Infinity);
    if (order === 'price-desc') return (b.price ?? -Infinity) - (a.price ?? -Infinity);
    if (order === 'name') return a.name.localeCompare(b.name, 'es', { numeric: true });
    const exact = (p: WholesaleProduct) => normalizeDevice(p.sku) === normalizeDevice(query) ? 100 : Number(!p.image.includes('isologo')) * 2 + Number(hasOffer(p));
    return exact(b) - exact(a);
  });
}
export function wholesaleFacets(products: WholesaleProduct[]) {
  return {
    devices: normalizeDevices(products.flatMap(p => p.devices)),
    classifications: [...new Set(products.map(p => p.classification).filter(Boolean))].sort(),
    brands: [...new Set(products.map(p => p.brand))].sort((a, b) => a.localeCompare(b, 'es')),
    categories: [...new Set(products.map(p => p.category))].sort((a, b) => a.localeCompare(b, 'es')),
  };
}
