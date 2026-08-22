import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { db } from "@/database/Config";

// This is the GA4 property currently owned by TECPOINT. Keep the production
// environment variable as the first choice so a stale Firestore value cannot
// silently send traffic to a different Analytics property.
export const OFFICIAL_GA_MEASUREMENT_ID = "G-3E8ZMRPD00";

export type StoreLocation = { id: string; city: string; name: string; detail: string; phone: string; maps: string };
export type SiteConfig = {
  mainWhatsApp: string;
  onlineWhatsApp: string;
  wholesaleWhatsApp: string;
  metaPixelId: string;
  gaMeasurementId: string;
  googleSiteVerification: string;
  searchConsoleProperty: string;
  locations: StoreLocation[];
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  mainWhatsApp: "50497157784",
  onlineWhatsApp: "50494659287",
  wholesaleWhatsApp: "50498191003",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  gaMeasurementId:
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    OFFICIAL_GA_MEASUREMENT_ID,
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "rGu_PQAnMb87mm_8dS9oWQPpkuhg8eUwEuC8-3xKiDc",
  searchConsoleProperty: "https://tecpoint.ws/",
  locations: [
    { id: "plaza-carolina", city: "San Pedro Sula", name: "Plaza Carolina", detail: "Segundo nivel, bulevar Mackay", phone: "50493385732", maps: "https://www.google.com/maps/search/?api=1&query=TECPOINT%20Plaza%20Carolina%20San%20Pedro%20Sula" },
    { id: "portal-viera", city: "Tegucigalpa", name: "Portal de Viera", detail: "Tercer nivel, km 3 carretera a El Hatillo", phone: "50495200523", maps: "https://www.google.com/maps/search/?api=1&query=TECPOINT%20Portal%20de%20Viera%20Tegucigalpa" },
    { id: "mayoreo-pickup", city: "San Pedro Sula", name: "Mayoreo y Pick Up", detail: "Barrio Los Andes, 7 calle, 14 avenida", phone: "50498191003", maps: "https://www.google.com/maps/search/?api=1&query=TECPOINT%20Barrio%20Los%20Andes%207%20Calle%2014%20Avenida%20San%20Pedro%20Sula" },
  ],
};

const SiteConfigContext = createContext<SiteConfig>(DEFAULT_SITE_CONFIG);
const digits = (value: unknown, fallback: string) => String(value || fallback).replace(/\D/g, "");

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<Partial<SiteConfig>>({});
  useEffect(() => {
    getDoc(doc(db, "site_settings", "general"))
      .then((snapshot) => snapshot.exists() && setRemote(snapshot.data() as Partial<SiteConfig>))
      .catch(() => undefined);
  }, []);
  const value = useMemo<SiteConfig>(() => ({
    ...DEFAULT_SITE_CONFIG,
    ...remote,
    mainWhatsApp: digits(remote.mainWhatsApp, DEFAULT_SITE_CONFIG.mainWhatsApp),
    onlineWhatsApp: digits(remote.onlineWhatsApp, DEFAULT_SITE_CONFIG.onlineWhatsApp),
    wholesaleWhatsApp: digits(remote.wholesaleWhatsApp, DEFAULT_SITE_CONFIG.wholesaleWhatsApp),
    gaMeasurementId:
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
      DEFAULT_SITE_CONFIG.gaMeasurementId,
    locations: Array.isArray(remote.locations) && remote.locations.length ? remote.locations : DEFAULT_SITE_CONFIG.locations,
  }), [remote]);
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export const useSiteConfig = () => useContext(SiteConfigContext);
export function whatsappLink(phone: string, message: string) { return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`; }
