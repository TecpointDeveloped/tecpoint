import { matchesDevice, productFamily } from './catalogFilters';
import { normalizeDevice, normalizeDevices, type DeviceCompatibility } from './wholesaleProductRules';
import { displayTitle } from './productPresentation';
import type { WholesaleProduct } from './types';

export const deviceKey = (d: DeviceCompatibility) => `${normalizeDevice(d.manufacturer)}|${normalizeDevice(d.model)}`;

// Only the explicit, reviewed device associations establish compatibility.
// A similar title, SKU prefix or image is never a substitute for that association.
export function accessoryDevices(products: WholesaleProduct[], current: WholesaleProduct) {
  const family = productFamily(current);
  if (family === 'other' || !current.devices.length) return [];
  return normalizeDevices(products.filter(p => p.stock > 0 && productFamily(p) === family).flatMap(p => p.devices))
    .sort((a, b) => a.manufacturer.localeCompare(b.manufacturer, 'es') || a.model.localeCompare(b.model, 'es', { numeric: true }));
}

export function accessoryOptions(products: WholesaleProduct[], current: WholesaleProduct, device: DeviceCompatibility) {
  const family = productFamily(current);
  if (family === 'other' || !current.devices.length) return [];
  return products.filter(p => p.stock > 0 && productFamily(p) === family && matchesDevice(p, device.manufacturer, device.model))
    .sort((a, b) => Number(a.image.includes('isologo')) - Number(b.image.includes('isologo')) || a.name.localeCompare(b.name, 'es', { numeric: true }));
}

export function optionLabel(p: WholesaleProduct, device: DeviceCompatibility) {
  let { title, variant } = displayTitle(p.name, p.brand);
  // Algunos títulos de cobertores terminan en un color literal sin guion.
  if (!variant && productFamily(p) === 'covers') {
    const suffix = title.match(/\s+(Gold Stripe|Silver Stripe|White Gold|Rose Gold|Prismatic|Iridescent|Silver|Black|Blue|Pink|Purple|Green|Brown|Clear|Smoke)$/i);
    if (suffix) { variant = suffix[1]; title = title.slice(0, -suffix[0].length); }
  }
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const words = (value: string) => escape(value).replace(/\s+/g, '\\s*');
  // Shorten only presentation; preserve the original title and SKU as the identity.
  title = title.replace(new RegExp(`\\b(?:${words(device.model)}|${words(device.manufacturer)}|Galaxy)\\b`, 'gi'), '')
    .replace(/\b(?:forro|cobertor|funda|case|para|con|en|with)\b/gi, '')
    .replace(/\(\s*\d+(?:\.\d+)?\s*(?:["″]|pulgadas)?\s*\)/gi, '')
    .replace(/\s+/g, ' ').trim();
  return { design: title || p.classification || 'Diseño disponible', variant: variant || '' };
}

/** Una familia de color exige marca, diseño y dispositivos revisados idénticos. */
export function caseFamilyKey(p: WholesaleProduct) {
  if (productFamily(p) !== 'covers' || !p.devices.length) return '';
  const { design, variant } = optionLabel(p, p.devices[0]);
  if (!variant) return ''; // Nunca deducir un color por SKU o fotografía.
  const style = normalizeDevice(design)
    .replace(/silicona liquida/g, 'liquid silicone')
    .replace(/cuero vegano/g, 'vegan leather')
    .replace(/duo hybrid/g, 'duohybrid')
    .replace(/\s+/g, ' ').trim();
  return `${normalizeDevice(p.brand)}|${normalizeDevices(p.devices).map(deviceKey).sort().join(',')}|${style}`;
}

export function caseColor(p: WholesaleProduct) {
  const literal = optionLabel(p, p.devices[0] || { manufacturer: '', model: '' }).variant;
  const translations: Record<string, string> = {
    black: 'Negro', blue: 'Azul', pink: 'Rosado', purple: 'Morado', green: 'Verde', brown: 'Café', red: 'Rojo',
    clear: 'Transparente', smoke: 'Humo', 'clear matte': 'Transparente mate', 'smoke matte': 'Humo mate',
    'transparente matte': 'Transparente mate', 'humo matte': 'Humo mate',
    prismatic: 'Prismático', iridescent: 'Iridiscente', silver: 'Plateado', 'rose gold': 'Oro rosa',
    'white gold': 'Blanco con dorado', 'gold stripe': 'Franja dorada', 'silver stripe': 'Franja plateada',
    'silver black': 'Plateado con negro', 'white / black': 'Blanco / negro', 'white/pink': 'Blanco / rosado',
  };
  return translations[normalizeDevice(literal)] || (literal ? literal[0].toUpperCase() + literal.slice(1) : 'Color por confirmar');
}

export function colorVariants(products: WholesaleProduct[], current: WholesaleProduct) {
  const family = caseFamilyKey(current);
  if (!family) return current.stock > 0 ? [current] : [];
  return products.filter(p => p.stock > 0 && caseFamilyKey(p) === family)
    .sort((a, b) => caseColor(a).localeCompare(caseColor(b), 'es') || a.sku.localeCompare(b.sku));
}
