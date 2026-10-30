export type DeviceCompatibility = { manufacturer: string; model: string };
export type WholesalePromotion = {
  active: boolean;
  originalPrice: number;
  finalPrice: number;
  startsAt: string;
  endsAt: string;
  source?: string;
};
export function normalizeDevice(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}
export function normalizeDevices(value: unknown): DeviceCompatibility[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item.manufacturer !== 'string' || typeof item.model !== 'string') return [];
    const manufacturer = item.manufacturer.replace(/\s+/g, ' ').trim().slice(0, 80);
    const model = item.model.replace(/\s+/g, ' ').trim().slice(0, 120);
    const key = `${normalizeDevice(manufacturer)}|${normalizeDevice(model)}`;
    if (!manufacturer || !model || seen.has(key)) return [];
    seen.add(key);
    return [{ manufacturer, model }];
  });
}
// Retain supplied associations, but quarantine clear case/model contradictions.
// Do not infer replacement compatibility from a title that might itself be wrong.
export function reviewedDevices(name: string, devices: DeviceCompatibility[], category = '') {
  if (!/cobertor|funda|\bcase\b|forro/i.test(`${name} ${category}`)) return devices;
  const models = [...name.matchAll(/\biphone\s*(\d+)\s*(pro\s*max|pro|plus|mini|air|e\b)?/gi)];
  if (models.length !== 1 || /\biphone[^()]*[\/&+]/i.test(name)) return devices;
  const named = `iphone${models[0][1]}${models[0][2] || ''}`.replace(/\s/g, '').toLowerCase();
  return devices.filter(d => normalizeDevice(d.manufacturer) !== 'apple' || normalizeDevice(d.model).replace(/\s/g, '') === named);
}
export function wholesalePricing(basePrice: number, promotion?: WholesalePromotion, now = Date.now()) {
  const cents = Math.round((basePrice + Number.EPSILON) * 100);
  const normal = { price: Number.isFinite(cents) && cents > 0 ? cents / 100 : null, originalPrice: null as number | null, discountPercent: null as number | null };
  if (!promotion || promotion.active !== true) return normal;
  const start = Date.parse(promotion.startsAt), end = Date.parse(promotion.endsAt);
  const original = Math.round(promotion.originalPrice * 100), final = Math.round(promotion.finalPrice * 100);
  if (![start,end,original,final].every(Number.isFinite) || start >= end || now < start || now >= end || original !== cents || final <= 0 || final >= original) return normal;
  return { price: final / 100, originalPrice: original / 100, discountPercent: Math.round((1 - final / original) * 10000) / 100 };
}
export function safeQuantity(value: number, stock: number) {
  return Math.max(1, Math.min(Math.max(1, Math.floor(stock)), Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1));
}
