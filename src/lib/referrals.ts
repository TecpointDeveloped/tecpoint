import currentCatalog from "@/data/current-catalog-w31.json";

export type ReferralOwnerType = "employee" | "influencer" | "tecpoint";

export interface ReferralCode {
  code: string;
  ownerName: string;
  ownerType: ReferralOwnerType;
  discountPercent: number;
  active: boolean;
  uses: number;
}

export const INITIAL_REFERRAL_CODES: ReferralCode[] = [
  "JORGE", "BENJAMIN", "EDGAR", "JOHANNA", "GLADIS", "ANGELO", "IRANIA", "SANDY",
].map((name) => ({ code: `${name}15`, ownerName: name, ownerType: "employee", discountPercent: 15, active: true, uses: 0 }));

export function normalizeReferralCode(value: unknown) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 30);
}

export function verifiedReferralItems(items: unknown) {
  const catalog = new Map(currentCatalog.records.map((item) => [item.sku, item]));
  if (!Array.isArray(items)) return [];
  return items.slice(0, 100).flatMap((raw) => {
    const item = raw as { sku?: unknown; quantity?: unknown };
    const sku = String(item.sku || "").trim();
    const source = catalog.get(sku);
    if (!source) return [];
    const quantity = Math.max(1, Math.min(50, Math.floor(Number(item.quantity) || 1)));
    return [{ sku, name: source.description, quantity, unitPrice: Number(source.detailPrice), lineTotal: Number(source.detailPrice) * quantity }];
  });
}
