import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { isAdminEmail } from "@/lib/adminAccess";
import styles from "@/styles/adminWholesale.module.css";

type Product = { id:string; sku:string; producto:string; brand:string; image:string; wholesaleImage:string; retailPrice:number; wholesalePrice:number; wholesaleEnabled:boolean; wholesaleCategory:string };
type Lead = { id:string; name:string; whatsapp:string; email:string; storeName:string; status:string; createdAt?:string|null };
type Pagination = { page:number; pageSize:number; totalItems:number; totalPages:number };
type SalesRank = { sku:string; unitsSold:number; rank:number; name?:string; catalogVisible?:boolean };
type SalesSummary = { configured:boolean; fileName?:string; processedRows?:number; matchedCount?:number; unmatchedSkus?:string[]; ranking:SalesRank[]; uploadedAt?:string|null };
type Tab = "products" | "sales" | "leads";

const EMPTY_SALES: SalesSummary = { configured:false, ranking:[] };

function fileToBase64(file: File) {
  return file.arrayBuffer().then((arrayBuffer) => {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return window.btoa(binary);
  });
}

export default function AdminWholesale({ standalone = false }: { standalone?: boolean }) {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [authorized,setAuthorized]=useState<boolean|null>(null);
  const [products,setProducts]=useState<Product[]>([]);
  const [leads,setLeads]=useState<Lead[]>([]);
  const [sales,setSales]=useState<SalesSummary>(EMPTY_SALES);
  const [pagination,setPagination]=useState<Pagination>({page:1,pageSize:30,totalItems:0,totalPages:1});
  const [summary,setSummary]=useState({active:0,categories:0});
  const [tab,setTab]=useState<Tab>("products");
  const [query,setQuery]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");

  useEffect(()=>{
    if(!standalone){setAuthorized(isAdminEmail(currentUser?.email));return;}
    fetch("/api/wholesale-admin/session").then(response=>response.json()).then(data=>setAuthorized(Boolean(data.authenticated))).catch(()=>setAuthorized(false));
  },[currentUser,standalone]);

  const request=useCallback(async(method="GET",body?:object,path="/api/admin/wholesale")=>{
    const headers:Record<string,string>={"Content-Type":"application/json"};
    if(!standalone){if(!currentUser)throw new Error("Sesión no disponible.");headers.Authorization=`Bearer ${await currentUser.getIdToken()}`;}
    const response=await fetch(path,{method,headers,body:body?JSON.stringify(body):undefined});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"No fue posible completar la acción.");
    return data;
  },[currentUser,standalone]);

  const loadProducts=useCallback(async(page=1,search=query)=>{
    setBusy(true);
    try{const data=await request("GET",undefined,`/api/admin/wholesale?view=products&page=${page}&query=${encodeURIComponent(search)}`);setProducts(data.products);setPagination(data.pagination);setSummary(data.summary);setError("");}
    catch(reason){setError(reason instanceof Error?reason.message:"No fue posible cargar Mayoreo.");}
    finally{setBusy(false);}
  },[request,query]);

  const loadLeads=useCallback(async()=>{
    setBusy(true);
    try{const data=await request("GET",undefined,"/api/admin/wholesale?view=leads");setLeads(data.leads);setError("");}
    catch(reason){setError(reason instanceof Error?reason.message:"No fue posible cargar solicitudes.");}
    finally{setBusy(false);}
  },[request]);

  const loadSales=useCallback(async()=>{
    setBusy(true);
    try{const data=await request("GET",undefined,"/api/admin/wholesale-sales");setSales(data);setError("");}
    catch(reason){setError(reason instanceof Error?reason.message:"No fue posible cargar el ranking de ventas.");}
    finally{setBusy(false);}
  },[request]);

  useEffect(()=>{if(!authorized)return;const timer=window.setTimeout(()=>loadProducts(1,query),query?350:0);return()=>window.clearTimeout(timer);},[authorized,query,loadProducts]);
  useEffect(()=>{if(authorized)void loadSales();},[authorized,loadSales]);
  const visible=useMemo(()=>products,[products]);
  const categories=useMemo(()=>Array.from(new Set(products.map(product=>product.wholesaleCategory).filter(Boolean))).sort(),[products]);

  async function saveProduct(event:FormEvent<HTMLFormElement>,product:Product){
    event.preventDefault();const data=new FormData(event.currentTarget);setBusy(true);setSuccess("");
    try{await request("PATCH",{target:"product",id:product.id,wholesalePrice:data.get("wholesalePrice"),wholesaleCategory:data.get("wholesaleCategory"),wholesaleEnabled:data.get("wholesaleEnabled")==="on",wholesaleImage:data.get("wholesaleImage")});await loadProducts(pagination.page);setSuccess(`Se actualizó ${product.sku}.`);}
    catch(reason){setError(reason instanceof Error?reason.message:"No fue posible guardar.");setBusy(false);}
  }

  async function uploadImage(product:Product,file?:File){
    if(!file)return;if(!file.type.startsWith("image/")){setError("Seleccione un archivo de imagen válido.");return;}if(file.size>6*1024*1024){setError("La imagen debe pesar menos de 6 MB.");return;}
    setBusy(true);setError("");setSuccess("");
    try{const dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(new Error("No fue posible leer la imagen."));reader.readAsDataURL(file);});await request("POST",{id:product.id,dataUrl},"/api/wholesale-admin/image");await loadProducts(pagination.page);setSuccess(`Imagen de ${product.sku} actualizada.`);}
    catch(reason){setError(reason instanceof Error?reason.message:"No fue posible subir la imagen.");setBusy(false);}
  }

  async function uploadSales(file?:File){
    if(!file)return;if(!file.name.toLowerCase().endsWith(".xlsx")){setError("Seleccione un archivo de Excel .xlsx.");return;}if(file.size>6*1024*1024){setError("El Excel debe pesar menos de 6 MB.");return;}
    setBusy(true);setError("");setSuccess("");
    try{const dataBase64=await fileToBase64(file);const data=await request("POST",{fileName:file.name,dataBase64},"/api/admin/wholesale-sales");setSales(data);setSuccess(`Excel procesado: ${data.processedRows} filas y ${data.matchedCount} SKU encontrados en el catálogo.`);}
    catch(reason){setError(reason instanceof Error?reason.message:"No fue posible procesar el Excel.");}
    finally{setBusy(false);}
  }

  async function updateLead(lead:Lead,status:string){setBusy(true);try{await request("PATCH",{target:"lead",id:lead.id,status});await loadLeads();}catch(reason){setError(reason instanceof Error?reason.message:"No fue posible actualizar.");setBusy(false);}}
  function refreshCurrentTab(){if(tab==="products")void loadProducts(pagination.page);if(tab==="sales")void loadSales();if(tab==="leads")void loadLeads();}

  if((!standalone&&loading)||authorized===null)return <main className={styles.state}>Verificando acceso…</main>;
  if(!authorized)return <main className={styles.state}><h1>Acceso reservado</h1><Link href={standalone?"/mayoreo/admin/login":"/my-account"}>Iniciar sesión</Link></main>;

  return <><Head><title>Mayoreo | Administración TECPOINT</title><meta name="robots" content="noindex,nofollow"/></Head><main className={styles.page}>
    <header><div><Link href={standalone?"/mayoreo/catalogo":"/admin"}>← {standalone?"Catálogo de mayoreo":"Panel central"}</Link><p>GESTIÓN MAYORISTA INDEPENDIENTE</p><h1>Mayoreo.</h1></div><div><button onClick={refreshCurrentTab} disabled={busy}>{busy?"Actualizando…":"Actualizar datos"}</button>{standalone&&<button onClick={async()=>{await fetch("/api/wholesale-admin/session",{method:"DELETE"});await router.replace("/mayoreo/admin/login");}}>Cerrar sesión</button>}</div></header>
    {error&&<div className={styles.error}>{error}</div>}
    {success&&<div className={styles.success}>{success}</div>}
    <section className={styles.metrics}><article><span>Productos activos</span><strong>{summary.active}</strong></article><article><span>Categorías</span><strong>{summary.categories}</strong></article><article><span>Populares configurados</span><strong>{sales.ranking.filter(item=>item.catalogVisible).length}</strong></article></section>
    <nav className={styles.tabs}><button className={tab==="products"?styles.selected:""} onClick={()=>setTab("products")}>Productos y categorías</button><button className={tab==="sales"?styles.selected:""} onClick={()=>{setTab("sales");void loadSales();}}>Ventas y populares</button><button className={tab==="leads"?styles.selected:""} onClick={()=>{setTab("leads");if(!leads.length)void loadLeads();}}>Solicitudes recibidas</button></nav>

    {tab==="products"&&<><div className={styles.tools}><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar producto, SKU, marca o categoría"/><span>{pagination.totalItems} productos</span></div><section className={styles.productList}>{visible.map(product=><details key={product.id}><summary><div className={styles.productIdentity}>{product.image?<Image src={encodeURI(product.image)} alt="" width={72} height={72} unoptimized/>:<span className={styles.noImage}>Sin imagen</span>}<div><strong>{product.producto||"Producto sin nombre"}</strong><small>{product.sku} · {product.brand||"Sin marca"}</small></div></div><div className={styles.badges}>{product.wholesaleEnabled&&product.wholesalePrice>0?<b>VISIBLE EN MAYOREO</b>:<em>OCULTO</em>}<span>{product.wholesaleCategory||"Sin categoría"}</span></div></summary><form onSubmit={event=>saveProduct(event,product)}><label>Precio de mayoreo<input name="wholesalePrice" type="number" min="0" step="0.01" defaultValue={product.wholesalePrice}/></label><label>Categoría de mayoreo<input name="wholesaleCategory" list="wholesale-categories" defaultValue={product.wholesaleCategory}/></label><label className={styles.imageField}>Imagen exclusiva de mayoreo<input name="wholesaleImage" type="url" defaultValue={product.wholesaleImage} placeholder="Pegue una URL o suba una imagen"/><input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={event=>uploadImage(product,event.target.files?.[0])}/><small>JPG, PNG, WebP o AVIF · máximo 6 MB. Se optimiza automáticamente.</small></label><label className={styles.check}><input name="wholesaleEnabled" type="checkbox" defaultChecked={product.wholesaleEnabled}/>Mostrar en catálogo de Mayoreo</label><p>Precio de detalle actual: L {product.retailPrice.toLocaleString("es-HN",{minimumFractionDigits:2})}</p><button disabled={busy}>Guardar cambios</button></form></details>)}</section>{pagination.totalPages>1&&<nav className={styles.tools}><button disabled={busy||pagination.page===1} onClick={()=>loadProducts(pagination.page-1)}>Anterior</button><span>Página {pagination.page} de {pagination.totalPages}</span><button disabled={busy||pagination.page===pagination.totalPages} onClick={()=>loadProducts(pagination.page+1)}>Siguiente</button></nav>}<datalist id="wholesale-categories">{categories.map(category=><option key={category} value={category}/>)}</datalist></>}

    {tab==="sales"&&<section className={styles.salesPanel}><article className={styles.salesUpload}><div><span>ACTUALIZACIÓN AUTOMÁTICA</span><h2>Productos populares</h2><p>Suba el Excel de ventas. El sistema suma las unidades por SKU y muestra primero los productos más vendidos que estén disponibles en Mayoreo.</p></div><label className={styles.uploadButton}>{busy?"Procesando…":"Subir Excel de ventas"}<input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={busy} onChange={event=>{void uploadSales(event.target.files?.[0]);event.currentTarget.value="";}}/></label><small>Formato .xlsx · máximo 6 MB · requiere una columna “SKU” o “Código”. La columna “Cantidad” es recomendada.</small></article>{sales.configured?<><div className={styles.salesMeta}><div><span>Archivo</span><strong>{sales.fileName}</strong></div><div><span>Filas procesadas</span><strong>{sales.processedRows||0}</strong></div><div><span>SKU encontrados</span><strong>{sales.matchedCount||0}</strong></div><div><span>Última carga</span><strong>{sales.uploadedAt?new Date(sales.uploadedAt).toLocaleString("es-HN"):"Recién procesado"}</strong></div></div><div className={styles.rankingHeader}><div><span>RANKING ACTUAL</span><h2>Lo más vendido</h2></div><p>Los primeros productos disponibles aparecen automáticamente en el carrusel.</p></div><div className={styles.rankingList}>{sales.ranking.slice(0,20).map(item=><article key={item.sku}><b>#{item.rank}</b><div><strong>{item.name||item.sku}</strong><small>{item.sku}</small></div><span>{item.unitsSold.toLocaleString("es-HN")} unidades</span><em className={item.catalogVisible?styles.rankVisible:styles.rankHidden}>{item.catalogVisible?"EN CARRUSEL":"NO PUBLICABLE"}</em></article>)}</div>{Boolean(sales.unmatchedSkus?.length)&&<details className={styles.unmatched}><summary>{sales.unmatchedSkus?.length} SKU del Excel no existen en el catálogo</summary><p>{sales.unmatchedSkus?.join(", ")}</p></details>}</>:<div className={styles.empty}>Todavía no se ha subido un Excel de ventas. El carrusel aparecerá cuando haya un ranking válido.</div>}</section>}

    {tab==="leads"&&<section className={styles.leads}>{leads.length?leads.map(lead=><article key={lead.id}><div><small>{lead.createdAt?new Date(lead.createdAt).toLocaleString("es-HN"):"Fecha pendiente"}</small><h2>{lead.storeName||"Tienda sin nombre"}</h2><p>{lead.name} · {lead.whatsapp}</p><a href={`mailto:${lead.email}`}>{lead.email}</a></div><select value={lead.status} onChange={event=>updateLead(lead,event.target.value)}><option value="new">Nueva</option><option value="contacted">Contactada</option><option value="approved">Aprobada</option><option value="closed">Cerrada</option></select></article>):<div className={styles.empty}>Todavía no hay solicitudes de Mayoreo.</div>}</section>}
  </main></>;
}
