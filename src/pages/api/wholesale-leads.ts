import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { wholesaleCookieHeader } from "@/lib/wholesaleAccess.server";

function clean(value: unknown, maxLength: number) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

  const name = clean(req.body?.name, 90);
  const whatsapp = clean(req.body?.whatsapp, 24).replace(/[^\d+()\-\s]/g, "");
  const email = clean(req.body?.email, 120).toLowerCase();
  const storeName = clean(req.body?.storeName, 120);
  const website = clean(req.body?.website, 120);

  // Invisible honeypot: legitimate visitors never fill this field.
  if (website) return res.status(200).json({ ok: true });
  if (name.length < 2 || whatsapp.replace(/\D/g, "").length < 8 || storeName.length < 2) {
    return res.status(400).json({ error: "Revise el nombre, WhatsApp y nombre de tienda." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Ingrese un correo válido." });
  }

  const admin = getFirebaseAdmin();
  if (!admin) return res.status(503).json({ error: "El registro está temporalmente fuera de servicio." });

  await admin.db.collection("wholesale_leads").add({
    name,
    whatsapp,
    email,
    storeName,
    source: "tecpoint.ws/mayoreo",
    status: "new",
    createdAt: FieldValue.serverTimestamp(),
  });

  res.setHeader("Set-Cookie", wholesaleCookieHeader());
  return res.status(201).json({ ok: true });
}
