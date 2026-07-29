export type BrandAsset = {
  name: string;
  logo: string;
  accent: string;
};

const BRAND_ASSETS: BrandAsset[] = [
  { name: "Appacs", logo: "/logos/appacs.png", accent: "#76D660" },
  { name: "Apple", logo: "/logos/apple.png", accent: "#444444" },
  { name: "Deken", logo: "/logos/deken.png", accent: "#0099FF" },
  { name: "Ghostek", logo: "/logos/ghostek.png", accent: "#333333" },
  { name: "Hoco", logo: "/logos/hoco.png", accent: "#333333" },
  { name: "HyperGear", logo: "/logos/hypergear.png", accent: "#FF7F5C" },
  { name: "Krieg", logo: "/logos/krieg.png", accent: "#FFCB54" },
  { name: "Langsdom", logo: "/logos/langsdom.png", accent: "#111111" },
  { name: "Naztech", logo: "/logos/naztech.png", accent: "#00B9FF" },
  { name: "PowerPeak", logo: "/logos/powepeak.png", accent: "#FF666B" },
  { name: "Rock Space", logo: "/logos/rock-space.png", accent: "#63EBFF" },
  { name: "Samsung", logo: "/logos/samsung.png", accent: "#333333" },
  { name: "USG", logo: "/logos/usg.png", accent: "#555555" },
  { name: "XBase", logo: "/logos/xbase.png", accent: "#64F2CC" },
  { name: "XO", logo: "/logos/xo.png", accent: "#FF5252" },
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
