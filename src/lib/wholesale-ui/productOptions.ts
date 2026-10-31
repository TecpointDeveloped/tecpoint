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
  const label = displayTitle(p.name, p.brand);
  let title = label.title;
  const variant = label.variant;
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const words = (value: string) => escape(value).replace(/\s+/g, '\\s*');
  // Shorten only presentation; preserve the original title and SKU as the identity.
  title = title.replace(new RegExp(`\\b(?:${words(device.model)}|${words(device.manufacturer)}|Galaxy)\\b`, 'gi'), '')
    .replace(/\b(?:forro|cobertor|funda|case|para|con|en)\b/gi, '')
    .replace(/\(\s*\d+(?:\.\d+)?\s*(?:["″]|pulgadas)?\s*\)/gi, '')
    .replace(/\s+/g, ' ').trim();
  return { design: title || p.classification || 'Diseño disponible', variant: variant || '' };
}
