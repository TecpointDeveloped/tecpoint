import Head from "next/head";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { isAdminEmail } from "@/lib/adminAccess";
import styles from "@/styles/referralAdmin.module.css";

type Code = { code: string; ownerName: string; ownerType: string; discountPercent: number; active: boolean; uses: number };
type Use = { id: string; code: string; ownerName: string; createdAt?: string | null; items?: Array<{ sku: string; name: string; quantity: number }>; discount: number; total: number; status: string };

export default function ReferralAdmin() {
  const { currentUser, loading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [codes, setCodes] = useState<Code[]>([]);
  const [uses, setUses] = useState<Use[]>([]);
  const [error, setError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [code, setCode] = useState("");
  const [ownerType, setOwnerType] = useState("employee");

  useEffect(() => { setAuthorized(isAdminEmail(currentUser?.email)); }, [currentUser]);
  const request = useCallback(async (method = "GET", body?: object) => {
    if (!currentUser) throw new Error("Sesión no disponible.");
    const token = await currentUser.getIdToken();
    const response = await fetch("/api/referrals/admin", { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No fue posible completar la acción.");
    return data;
  }, [currentUser]);
  const load = useCallback(async () => { try { const data = await request(); setCodes(data.codes); setUses(data.uses); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Error inesperado."); } }, [request]);
  useEffect(() => { if (authorized) load(); }, [authorized, load]);
  async function initialize() { await request("POST", { action: "initialize" }); await load(); }
  async function toggle(item: Code) { await request("PATCH", { code: item.code, active: !item.active }); await load(); }
  async function create(event: FormEvent) { event.preventDefault(); await request("POST", { code, ownerName, ownerType }); setCode(""); setOwnerName(""); await load(); }

  if (loading || authorized === null) return <main className={styles.state}>Verificando acceso…</main>;
  if (!authorized) return <main className={styles.state}><h1>Acceso reservado</h1><p>Solo una cuenta administradora puede gestionar códigos.</p><Link href="/my-account">Iniciar sesión</Link></main>;
  return <><Head><title>Códigos y referidos | TECPOINT</title><meta name="robots" content="noindex,nofollow" /></Head><main className={styles.page}>
    <header><div><p>TECPOINT · ADMINISTRACIÓN</p><h1>Códigos y referidos.</h1></div><Link href="/admin/comercial">Centro comercial</Link></header>
    {error && <div className={styles.error}><strong>Configuración pendiente</strong><p>{error}</p><small>Agregue FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY en Vercel.</small></div>}
    <section className={styles.actions}><div><h2>Ocho códigos iniciales</h2><p>Todos aplican 15%. Puede pausarlos sin eliminar su historial.</p></div><button onClick={initialize}>Crear códigos iniciales</button></section>
    <form className={styles.form} onSubmit={create}><input value={ownerName} onChange={(e)=>setOwnerName(e.target.value)} placeholder="Nombre del empleado o influencer" required /><input value={code} onChange={(e)=>setCode(e.target.value.toUpperCase())} placeholder="CÓDIGO15" required /><select value={ownerType} onChange={(e)=>setOwnerType(e.target.value)}><option value="employee">Empleado</option><option value="influencer">Influencer</option><option value="tecpoint">TECPOINT</option></select><button>Agregar código</button></form>
    <section className={styles.grid}>{codes.map((item)=><article key={item.code}><span>{item.ownerType}</span><h3>{item.code}</h3><p>{item.ownerName} · {item.discountPercent}%</p><strong>{item.uses || 0} usos</strong><button className={item.active ? styles.active : styles.paused} onClick={()=>toggle(item)}>{item.active ? "Activo · Pausar" : "Pausado · Activar"}</button></article>)}</section>
    <section className={styles.history}><div><p>HISTORIAL</p><h2>Usos registrados</h2></div>{uses.length===0?<p className={styles.empty}>Todavía no hay usos registrados.</p>:<div className={styles.table}>{uses.map((use)=><article key={use.id}><div><strong>{use.code}</strong><span>{use.ownerName}</span></div><div><strong>{use.createdAt ? new Date(use.createdAt).toLocaleString("es-HN", { timeZone:"America/Tegucigalpa" }) : "Pendiente"}</strong><span>{use.status}</span></div><div><strong>L {Number(use.total).toFixed(2)}</strong><span>Descuento L {Number(use.discount).toFixed(2)}</span></div><details><summary>{use.items?.length || 0} artículos</summary>{use.items?.map((item)=><p key={`${use.id}-${item.sku}`}>{item.quantity} × {item.name} · {item.sku}</p>)}</details></article>)}</div>}</section>
  </main></>;
}
