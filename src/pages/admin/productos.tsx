import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/useAuth";
import styles from "@/styles/adminProducts.module.css";

type Item = {
  id: string; sku?: string; producto?: string; slug?: string; descripcion?: string;
  categorias?: string[]; Subcategorias?: string; marca_producto?: { marca?: string };
  precio?: { detalle?: number | string; mayoreo?: number | string };
  extradata?: { upc?: string; color?: string; wholesaleEnabled?: boolean; wholesaleCategory?: string };
  imagenes?: Record<string, { img?: string }>;
  issues: string[]; duplicates: string[]; publicReady: boolean;
};
type Summary = { total: number; ready: number; incomplete: number; duplicates: number; wholesale: number };
const issueNames: Record<string,string> = { sku:"SKU",upc:"UPC",nombre:"nombre",slug:"slug",descripcion:"descripción",categoria:"categoría",marca:"marca",precio:"precio",imagen:"imagen" };

export default function AdminProducts() {
  const { currentUser, loading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean|null>(null);
  const [items,setItems]=useState<Item[]>([]); const [summary,setSummary]=useState<Summary|null>(null);
  const [filter,setFilter]=useState("incomplete"); const [query,setQuery]=useState(""); const [error,setError]=useState(""); const [notice,setNotice]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>{if(!currentUser)return setAuthorized(false);currentUser.getIdTokenResult().then(t=>setAuthorized(t.claims.role==="admin"));},[currentUser]);
  const request=useCallback(async(method="GET",body?:object)=>{if(!currentUser)throw new Error("Sesión no disponible.");const token=await currentUser.getIdToken();const response=await fetch("/api/admin/catalog",{method,headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});const data=await response.json();if(!response.ok)throw new Error(data.error||"No fue posible cargar el catálogo.");return data;},[currentUser]);
  const load=useCallback(async()=>{setBusy(true);try{const data=await request();setItems(data.items);setSummary(data.summary);setError("");}catch(e){setError(e instanceof Error?e.message:"Error inesperado.");}finally{setBusy(false);}},[request]);
  useEffect(()=>{if(authorized)load();},[authorized,load]);
  const visible=useMemo(()=>items.filter(item=>filter==="all"||(filter==="ready"&&item.publicReady)||(filter==="incomplete"&&item.issues.length)||(filter==="duplicates"&&item.duplicates.length)||(filter==="wholesale"&&(item.extradata?.wholesaleEnabled||Number(item.precio?.mayoreo)>0))).filter(item=>`${item.sku} ${item.producto} ${item.extradata?.upc} ${item.extradata?.wholesaleCategory}`.toLowerCase().includes(query.toLowerCase())),[items,filter,query]);
  async function save(item:Item,form:HTMLFormElement){const data=new FormData(form);setBusy(true);try{await request("PATCH",{id:item.id,producto:data.get("producto"),slug:data.get("slug"),descripcion:data.get("descripcion"),categoria:data.get("categoria"),subcategoria:data.get("subcategoria"),marca:data.get("marca"),upc:data.get("upc"),color:data.get("color"),precioDetalle:data.get("precioDetalle"),precioMayoreo:data.get("precioMayoreo"),wholesaleEnabled:data.get("wholesaleEnabled")==="on",wholesaleCategory:data.get("wholesaleCategory"),imagen:data.get("imagen")});await load();}catch(e){setError(e instanceof Error?e.message:"No fue posible guardar.");setBusy(false);}}
  async function syncW34(action:"syncW34"|"syncW34Drafts"="syncW34"){setBusy(true);setNotice("");setError("");try{const result=await request("POST",{action});setNotice(`W34 sincronizado: ${result.created} creados y ${result.updated} actualizados.`);await load();}catch(e){setError(e instanceof Error?e.message:"No fue posible sincronizar W34.");setBusy(false);}}
  if(loading||authorized===null)return <main className={styles.state}>Verificando acceso…</main>;
  if(!authorized)return <main className={styles.state}><h1>Acceso reservado</h1><Link href="/my-account">Iniciar sesión</Link></main>;
  return <><Head><title>Productos | Administración TECPOINT</title><meta name="robots" content="noindex,nofollow"/></Head><main className={styles.page}>
    <header><div><Link href="/admin">← Panel central</Link><p>CATÁLOGO Y CALIDAD</p><h1>Productos.</h1></div><div className={styles.headerActions}><button onClick={()=>syncW34()} disabled={busy}>{busy?"Procesando…":"Sincronizar aprobados"}</button><button onClick={()=>syncW34("syncW34Drafts")} disabled={busy}>{busy?"Procesando…":"Preparar pendientes"}</button><button onClick={load} disabled={busy}>{busy?"Revisando…":"Actualizar auditoría"}</button></div></header>
    {error&&<div className={styles.error}>{error}</div>}
    {notice&&<div className={styles.notice}>{notice}</div>}
    <section className={styles.metrics}>{summary&&Object.entries(summary).map(([key,value])=><button key={key} onClick={()=>setFilter(key==="total"?"all":key)}><span>{key==="total"?"Total":key==="ready"?"Listos":key==="incomplete"?"Incompletos":key==="wholesale"?"Mayoreo":"Duplicados"}</span><strong>{value}</strong></button>)}</section>
    <section className={styles.tools}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre, SKU o UPC"/><span>{visible.length} resultados</span></section>
    <section className={styles.list}>{visible.map(item=><details key={item.id}><summary><div><strong>{item.producto||"Producto sin nombre"}</strong><span>{item.sku||"Sin SKU"} · {item.marca_producto?.marca||"Sin marca"}</span></div><div className={styles.badges}>{item.issues.map(issue=><b key={issue}>Falta {issueNames[issue]||issue}</b>)}{item.duplicates.map(issue=><b key={`d-${issue}`}>Duplicado {issue.toUpperCase()}</b>)}{item.publicReady&&<em>Visible</em>}</div></summary><form onSubmit={e=>{e.preventDefault();save(item,e.currentTarget)}}>
      <label>Nombre<input name="producto" defaultValue={item.producto}/></label><label>Slug<input name="slug" defaultValue={item.slug}/></label><label className={styles.wide}>Descripción<textarea name="descripcion" defaultValue={item.descripcion}/></label><label>Categoría detalle<input name="categoria" defaultValue={item.categorias?.[0]}/></label><label>Subcategoría<input name="subcategoria" defaultValue={item.Subcategorias}/></label><label>Marca<input name="marca" defaultValue={item.marca_producto?.marca}/></label><label>UPC<input name="upc" defaultValue={item.extradata?.upc}/></label><label>Color<input name="color" defaultValue={item.extradata?.color}/></label><label>Precio detalle<input name="precioDetalle" type="number" step="0.01" defaultValue={item.precio?.detalle}/></label><label>Precio mayoreo<input name="precioMayoreo" type="number" step="0.01" defaultValue={item.precio?.mayoreo}/></label><label>Categoría mayoreo<input name="wholesaleCategory" defaultValue={item.extradata?.wholesaleCategory||item.categorias?.[0]}/></label><label className={styles.checkLabel}><input name="wholesaleEnabled" type="checkbox" defaultChecked={item.extradata?.wholesaleEnabled||Number(item.precio?.mayoreo)>0}/> Mostrar en catálogo de mayoreo</label><label className={styles.wide}>Imagen principal<input name="imagen" defaultValue={item.imagenes?.imagen_01?.img||Object.values(item.imagenes||{})[0]?.img}/></label><div className={styles.notice}>El SKU no se modifica desde este panel. Los productos incompletos permanecen ocultos al público.</div><button disabled={busy}>Guardar y volver a validar</button>
    </form></details>)}</section>
  </main></>;
}
