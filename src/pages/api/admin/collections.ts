import type { NextApiRequest, NextApiResponse } from "next";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { isAdminEmail } from "@/lib/adminAccess";

async function requireAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const admin = getFirebaseAdmin();
  if (!token || !admin) return null;
  const decoded = await admin.auth.verifyIdToken(token);
  return isAdminEmail(decoded.email) ? admin : null;
}

function text(value: unknown, max = 1000) { return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max); }
function slug(value: unknown) { return text(value, 120).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function list(value: unknown) { return String(value ?? "").split(/[\n,]+/).map((item) => item.trim()).filter(Boolean).slice(0, 300); }
function timestamp(value: unknown) { const date=value?new Date(String(value)):null;return date&&!Number.isNaN(date.getTime())?Timestamp.fromDate(date):null; }

function payload(body: Record<string, unknown>) {
  return {
    name:text(body.name,120),slug:slug(body.slug||body.name),description:text(body.description,600),
    heroImageUrl:text(body.heroImageUrl,2000),productSkus:list(body.productSkus),keywords:list(body.keywords),
    active:body.active!==false,archived:body.archived===true,sortOrder:Number(body.sortOrder)||0,
    startsAt:timestamp(body.startsAt),endsAt:timestamp(body.endsAt),updatedAt:FieldValue.serverTimestamp(),
  };
}

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    const admin=await requireAdmin(req);if(!admin)return res.status(403).json({error:"Acceso administrativo requerido."});
    const collection=admin.db.collection("site_collections");
    if(req.method==="GET"){
      const child=collection.doc("dia-del-nino");const current=await child.get();
      if(!current.exists)await child.set({name:"Día del Niño",slug:"dia-del-nino",description:"Tecnología y accesorios para celebrar, aprender, jugar y compartir.",heroImageUrl:"",productSkus:[],keywords:["audifono","parlante","gaming","smartwatch","tablet"],active:true,archived:false,sortOrder:0,startsAt:null,endsAt:null,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
      const snapshot=await collection.orderBy("sortOrder").get();
      return res.status(200).json({items:snapshot.docs.map((document)=>{const data=document.data();return{id:document.id,...data,startsAt:data.startsAt?.toDate?.().toISOString()||null,endsAt:data.endsAt?.toDate?.().toISOString()||null};})});
    }
    if(req.method==="POST"){
      const record=payload(req.body||{});if(!record.name||!record.slug)return res.status(400).json({error:"Agregue nombre y slug."});
      const reference=collection.doc(record.slug);if((await reference.get()).exists)return res.status(409).json({error:"Ese enlace ya existe."});
      await reference.set({...record,createdAt:FieldValue.serverTimestamp()});return res.status(201).json({id:reference.id});
    }
    if(req.method==="PATCH"){
      const id=slug(req.body?.id);if(!id)return res.status(400).json({error:"Colección inválida."});
      const record=payload(req.body||{});await collection.doc(id).update(record);return res.status(200).json({ok:true});
    }
    return res.status(405).json({error:"Método no permitido."});
  }catch(error){console.error("Collections admin error",error);return res.status(500).json({error:"No fue posible administrar las colecciones."});}
}
