import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/useAuth";
import styles from "@/styles/adminWholesale.module.css";

type Product = { id:string; sku:string; producto:string; brand:string; image:string; retailPrice:number; wholesalePrice:number; wholesaleEnabled:boolean; wholesaleCategory:string };
type Lead = { id:string; name:string; whatsapp:string; email:string; storeName:string; status:string; createdAt?:string|null };

export default function AdminWholesale() {
  const { currentUser, loading } = useAuth();
  const [authorized,setAuthorized]=useState<boolean|null>(null);
  const [products,setProducts]=useState<Product[]>([]); const [leads,setLeads]=useState<Lead[]>([]);
  const [tab,setTab]=useState<"products"|"leads">("products"); const [query,setQuery]=useState("");
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  useEffect(()=>{if(!currentUser)return setAuthorized(false);currentUser.getIdTokenResult().then(token=>setAuthorized(token.claims.role==="admin"));},[currentUser]);
  const request=useCallback(async(method="GET",body?:object)=>{if(!currentUser)throw new Error("Sesión no disponible.");const token=await currentUser.getIdToken();const response=await fetch("/api/admin/wholesale",{method,headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});const data=await response.json();if(!response.ok)throw new Error(data.error||"No fue posible completar la acción.");return data;},[currentUser]);
  const load=useCallback(async()=>{setBusy(true);try{const data=await request();setProducts(data.products);setLeads(data.leads);setError("");}catch(reason){setError(reason instanceof Error?reason.message:"No fue posible cargar Mayoreo.");}finally{setBusy(false);}},[request]);
  useEffect(()=>{if(authorized)load();},[authorized,load]);
  const visible=useMemo(()=>products.filter(product=>`${product.sku} ${product.producto} ${product.brand} ${product.wholesaleCategory}`.toLowerCase().includes(query.toLowerCase())),[products,query]);
  const categories=useMemo(()=>Array.from(new Set(products.map(product=>product.wholesaleCategory).filter(Boolean))).sort(),[products]);
  async function saveProduct(event:FormEvent<HTMLFormElement>,product:Product){event.preventDefault();const data=new FormData(event.currentTarget);setBusy(true);try{await request("PATCH",{target:"product",id:product.id,wholesalePrice:data.get("wholesalePrice"),wholesaleCategory:data.get("wholesaleCategory"),wholesaleEnabled:data.get("wholesaleEnabled")==="on"});await load();}catch(reason){setError(reason instanceof Error?reason.message:"No fue posible guardar.");setBusy(false);}}
  async function updateLead(lead:Lead,status:string){setBusy(true);try{await request("PATCH",{target:"lead",id:lead.id,status});await load();}catch(reason){setError(reason instanceof Error?reason.message:"No fue posible actualizar.");setBusy(false);}}
  if(loading||authorized===null)return <main className={styles.state}>Verificando acceso…</main>;
  if(!authorized)return <main className={styles.state}><h1>Acceso reservado</h1><Link href="/my-account">Iniciar sesión</Link></main>;
  const active=products.filter(product=>product.wholesaleEnabled&&product.wholesalePrice>0).length;
  return <><Head><title>Mayoreo | Administración TECPOINT</title><meta name="robots" content="noindex,nofollow"/></Head><main className={styles.page}>
    <header><div><Link href="/admin">← Panel central</Link><p>GESTIÓN MAYORISTA</p><h1>Mayoreo.</h1></div><button onClick={load} disabled={busy}>{busy?"Actualizando…":"Actualizar datos"}</button></header>
    {error&&<div className={styles.error}>{error}</div>}
    <section className={styles.metrics}><article><span>Productos activos</span><strong>{active}</strong></article><article><span>Categorías</span><strong>{categories.length}</strong></article><article><span>Solicitudes nuevas</span><strong>{leads.filter(lead=>lead.status==="new").length}</strong></article></section>
    <nav className={styles.tabs}><button className={tab==="products"?styles.selected:""} onClick={()=>setTab("products")}>Productos y categorías</button><button className={tab==="leads"?styles.selected:""} onClick={()=>setTab("leads")}>Solicitudes recibidas</button></nav>
    {tab==="products"?<><div className={styles.tools}><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar producto, SKU, marca o categoría"/><span>{visible.length} productos</span></div><section className={styles.productList}>{visible.map(product=><details key={product.id}><summary><div className={styles.productIdentity}>{product.image?<Image src={encodeURI(product.image)} alt="" width={72} height={72} unoptimized/>:<span className={styles.noImage}>Sin imagen</span>}<div><strong>{product.producto||"Producto sin nombre"}</strong><small>{product.sku} · {product.brand||"Sin marca"}</small></div></div><div className={styles.badges}>{product.wholesaleEnabled&&product.wholesalePrice>0?<b>VISIBLE EN MAYOREO</b>:<em>OCULTO</em>}<span>{product.wholesaleCategory||"Sin categoría"}</span></div></summary><form onSubmit={event=>saveProduct(event,product)}><label>Precio de mayoreo<input name="wholesalePrice" type="number" min="0" step="0.01" defaultValue={product.wholesalePrice}/></label><label>Categoría de mayoreo<input name="wholesaleCategory" list="wholesale-categories" defaultValue={product.wholesaleCategory}/></label><label className={styles.check}><input name="wholesaleEnabled" type="checkbox" defaultChecked={product.wholesaleEnabled}/>Mostrar en catálogo de Mayoreo</label><p>Precio de detalle actual: L {product.retailPrice.toLocaleString("es-HN",{minimumFractionDigits:2})}</p><button disabled={busy}>Guardar cambios</button></form></details>)}</section><datalist id="wholesale-categories">{categories.map(category=><option key={category} value={category}/>)}</datalist></>:<section className={styles.leads}>{leads.length?leads.map(lead=><article key={lead.id}><div><small>{lead.createdAt?new Date(lead.createdAt).toLocaleString("es-HN"):"Fecha pendiente"}</small><h2>{lead.storeName||"Tienda sin nombre"}</h2><p>{lead.name} · {lead.whatsapp}</p><a href={`mailto:${lead.email}`}>{lead.email}</a></div><select value={lead.status} onChange={event=>updateLead(lead,event.target.value)}><option value="new">Nueva</option><option value="contacted">Contactada</option><option value="approved">Aprobada</option><option value="closed">Cerrada</option></select></article>):<div className={styles.empty}>Todavía no hay solicitudes de Mayoreo.</div>}</section>}
  </main></>;
}
