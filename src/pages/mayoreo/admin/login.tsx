import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "@/styles/wholesaleAdminLogin.module.css";

export default function WholesaleAdminLogin() {
  const router = useRouter();
  const [username,setUsername]=useState("TECPOINT MAYOREO"); const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  useEffect(()=>{fetch("/api/wholesale-admin/session").then(r=>r.json()).then(d=>{if(d.authenticated)router.replace("/mayoreo/admin");}).catch(()=>undefined);},[router]);
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError("");try{const response=await fetch("/api/wholesale-admin/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});const data=await response.json();if(!response.ok)throw new Error(data.error||"No fue posible iniciar sesión.");await router.replace("/mayoreo/admin");}catch(reason){setError(reason instanceof Error?reason.message:"No fue posible iniciar sesión.");setBusy(false);}}
  return <><Head><title>Acceso Mayoreo | TECPOINT</title><meta name="robots" content="noindex,nofollow"/></Head><main className={styles.page}><section className={styles.card}><p>ADMINISTRACIÓN INDEPENDIENTE</p><h1>TECPOINT Mayoreo</h1><span>Gestione precios, categorías, productos visibles y solicitudes mayoristas.</span><form onSubmit={submit}><label>Usuario<input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" required/></label><label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>{error&&<div className={styles.error}>{error}</div>}<button disabled={busy}>{busy?"Verificando…":"Entrar al centro de mayoreo"}</button></form><Link href="/mayoreo/catalogo">← Volver al catálogo</Link></section></main></>;
}
