import type { WholesaleProduct } from './types';
export type OrderItem = { sku: string; quantity: number };
export type CartLine = WholesaleProduct & { quantity: number };
export type SavedList = { id: string; name: string; savedAt: string; items: OrderItem[] };
export const CART_KEY = 'tecpoint_wholesale_cart_v1';
export const LISTS_KEY = 'tecpoint_wholesale_lists_v1';
export function resolveOrder(items: unknown, products: WholesaleProduct[]): CartLine[] {
  if (!Array.isArray(items)) return [];
  const bySku = new Map(products.map(p => [p.sku, p]));
  const quantities = new Map<string, number>();
  for (const item of items.slice(0, 2000)) {
    if (!item || typeof item.sku !== 'string' || typeof item.quantity !== 'number' || !Number.isFinite(item.quantity) || item.quantity < 1) continue;
    const p = bySku.get(item.sku);
    if (!p || p.stock < 1) continue;
    quantities.set(item.sku, Math.min(Math.floor(p.stock), (quantities.get(item.sku) || 0) + Math.floor(item.quantity)));
  }
  return [...quantities].map(([sku, quantity]) => ({ ...bySku.get(sku)!, quantity }));
}
export function mergeOrder(cart: CartLine[], items: OrderItem[], products: WholesaleProduct[]) { return resolveOrder([...cart, ...items], products); }
export function orderItems(cart: CartLine[]): OrderItem[] { return cart.map(({ sku, quantity }) => ({ sku, quantity })); }
export function orderTotal(cart: CartLine[]) { return cart.reduce((sum, p) => sum + Math.round((p.price || 0) * 100) * p.quantity, 0) / 100; }
export function readLists(value: unknown): SavedList[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).flatMap(entry => {
    if (!entry || typeof entry !== 'object') return [];
    const list = entry as Record<string, unknown>;
    if (typeof list.id !== 'string' || typeof list.name !== 'string' || typeof list.savedAt !== 'string' || !Array.isArray(list.items)) return [];
    const items = list.items.slice(0, 1000).flatMap(item => {
      if (!item || typeof item !== 'object') return [];
      const candidate = item as Record<string, unknown>;
      if (typeof candidate.sku !== 'string' || typeof candidate.quantity !== 'number' || !Number.isFinite(candidate.quantity) || candidate.quantity <= 0) return [];
      return [{ sku: candidate.sku, quantity: Math.floor(candidate.quantity) }];
    });
    return [{ id: list.id.slice(0, 100), name: list.name.slice(0, 60), savedAt: list.savedAt, items }];
  });
}
