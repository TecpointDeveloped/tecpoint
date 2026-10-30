export type BrandAsset = {
  name: string;
  logo: string;
  accent: string;
};

const BRAND_ASSETS: BrandAsset[] = [
  { name: "Appacs", logo: "/tecpoint-catalog-ui/logos/appacs.webp", accent: "#76D660" },
  { name: "Apple", logo: "/tecpoint-catalog-ui/logos/apple.webp", accent: "#444444" },
  { name: "Coast", logo: "/tecpoint-catalog-ui/logos/coast.webp", accent: "#333333" },
  { name: "Deken", logo: "/tecpoint-catalog-ui/logos/deken.webp", accent: "#0099FF" },
  { name: "Ghostek", logo: "/tecpoint-catalog-ui/logos/ghostek.webp", accent: "#333333" },
  { name: "Hoco", logo: "/tecpoint-catalog-ui/logos/hoco.webp", accent: "#333333" },
  { name: "HyperGear", logo: "/tecpoint-catalog-ui/logos/hypergear.webp", accent: "#FF7F5C" },
  { name: "Krieg", logo: "/tecpoint-catalog-ui/logos/krieg.webp", accent: "#FFCB54" },
  { name: "Langsdom", logo: "/tecpoint-catalog-ui/logos/langsdom.webp", accent: "#111111" },
  { name: "Naztech", logo: "/tecpoint-catalog-ui/logos/naztech.webp", accent: "#00B9FF" },
  { name: "PowerPeak", logo: "/tecpoint-catalog-ui/logos/powepeak.webp", accent: "#FF666B" },
  { name: "Rock Space", logo: "/tecpoint-catalog-ui/logos/rock-space.webp", accent: "#63EBFF" },
  { name: "Samsung", logo: "/tecpoint-catalog-ui/logos/samsung.webp", accent: "#333333" },
  { name: "USG", logo: "/tecpoint-catalog-ui/logos/usg.webp", accent: "#555555" },
  { name: "XBase", logo: "/tecpoint-catalog-ui/logos/xbase.webp", accent: "#64F2CC" },
  { name: "XO", logo: "/tecpoint-catalog-ui/logos/xo.webp", accent: "#FF5252" },
];

const normalizeBrandKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const assetsByName = new Map(
  BRAND_ASSETS.map((asset) => [normalizeBrandKey(asset.name), asset]),
);
assetsByName.set(
  normalizeBrandKey("Urban Sound Gear"),
  assetsByName.get(normalizeBrandKey("USG"))!,
);

export function getBrandAsset(value?: string) {
  if (!value) return undefined;
  return assetsByName.get(normalizeBrandKey(value));
}

export function canonicalBrandName(value?: string) {
  return getBrandAsset(value)?.name || value?.trim() || "";
}

export function brandLogo(value?: string) {
  return getBrandAsset(value)?.logo || "";
}

export const brandAssets = BRAND_ASSETS;
