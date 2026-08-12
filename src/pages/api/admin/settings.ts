import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

type StoreLocation = { id: string; city: string; name: string; detail: string; phone: string; maps: string };
const defaults = {
  mainWhatsApp: "50497157784", onlineWhatsApp: "50494659287", wholesaleWhatsApp: "50498191003",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "", gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "rGu_PQAnMb87mm_8dS9oWQPpkuhg8eUwEuC8-3xKiDc", searchConsoleProperty: "https://tecpoint.ws/",
  locations: [
    { id:"plaza-carolina",city:"San Pedro Sula",name:"Plaza Carolina",detail:"Segundo nivel, bulevar Mackay",phone:"50493385732",maps:"https://www.google.com/maps/search/?api=1&query=TECPOINT%20Plaza%20Carolina%20San%20Pedro%20Sula" },
    { id:"portal-viera",city:"Tegucigalpa",name:"Portal de Viera",detail:"Tercer nivel, km 3 carretera a El Hatillo",phone:"50495200523",maps:"https://www.google.com/maps/search/?api=1&query=TECPOINT%20Portal%20de%20Viera%20Tegucigalpa" },
    { id:"mayoreo-pickup",city:"San Pedro Sula",name:"Mayoreo y Pick Up",detail:"Barrio Los Andes, 7 calle, 14 avenida",phone:"50498191003",maps:"https://www.google.com/maps/search/?api=1&query=TECPOINT%20Barrio%20Los%20Andes%207%20Calle%2014%20Avenida%20San%20Pedro%20Sula" },
  ],
};

async function requireAdmin(req: NextApiRequest) {
  const admin = getFirebaseAdmin();
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!admin || !token) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  return decoded.role === "admin" ? admin : null;
}
const text = (value: unknown, max = 1000) => String(value ?? "").trim().slice(0, max);
const phone = (value: unknown) => text(value, 30).replace(/\D/g, "").slice(0, 15);
function locations(value: unknown): StoreLocation[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((item, index) => ({
    id: text(item?.id, 100) || `ubicacion-${index + 1}`,
    city: text(item?.city, 100), name: text(item?.name, 140), detail: text(item?.detail, 300),
    phone: phone(item?.phone), maps: text(item?.maps, 1500),
  })).filter((item) => item.name && item.phone);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return res.status(403).json({ error: "Acceso administrativo requerido." });
    const target = admin.db.collection("site_settings").doc("general");
    if (req.method === "GET") {
      const snapshot = await target.get();
      return res.status(200).json({ ...defaults, ...(snapshot.exists ? snapshot.data() : {}) });
    }
    if (req.method === "PATCH") {
      const nextLocations = locations(req.body?.locations);
      if (!phone(req.body?.mainWhatsApp) || !phone(req.body?.onlineWhatsApp) || !phone(req.body?.wholesaleWhatsApp)) return res.status(400).json({ error: "Los tres números de WhatsApp son obligatorios." });
      if (!nextLocations.length) return res.status(400).json({ error: "Agregue al menos una ubicación válida." });
      const record = {
        mainWhatsApp: phone(req.body.mainWhatsApp), onlineWhatsApp: phone(req.body.onlineWhatsApp), wholesaleWhatsApp: phone(req.body.wholesaleWhatsApp),
        metaPixelId: text(req.body.metaPixelId, 80), gaMeasurementId: text(req.body.gaMeasurementId, 80),
        googleSiteVerification: text(req.body.googleSiteVerification, 300), searchConsoleProperty: text(req.body.searchConsoleProperty, 500),
        locations: nextLocations, updatedAt: FieldValue.serverTimestamp(),
      };
      await target.set(record, { merge: true });
      return res.status(200).json(record);
    }
    return res.status(405).json({ error: "Método no permitido." });
  } catch (error) {
    console.error("Settings admin error", error);
    return res.status(500).json({ error: "No fue posible guardar la configuración." });
  }
}
