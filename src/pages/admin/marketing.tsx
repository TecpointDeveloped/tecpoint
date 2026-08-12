import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "@/database/Config";
import { useAuth } from "@/context/useAuth";
import styles from "@/styles/adminMarketing.module.css";

type Kind = "banner" | "promotion";
type Asset = { id:string; kind:Kind; title:string; subtitle?:string; mediaType?:"image"|"video"; imageUrl?:string; mobileImageUrl?:string; videoUrl?:string; mobileVideoUrl?:string; posterUrl?:string; linkUrl?:string; cta?:string; alt?:string; artworkOnly?:boolean; active?:boolean; sortOrder?:number; startsAt?:string|null; endsAt?:string|null };
const empty = (kind:Kind):Omit<Asset,"id"> => ({ kind,title:"",subtitle:"",mediaType:"image",imageUrl:"",mobileImageUrl:"",videoUrl:"",mobileVideoUrl:"",posterUrl:"",linkUrl:"",cta:"Ver productos",alt:"",artworkOnly:false,active:true,sortOrder:0,startsAt:null,endsAt:null });
function localDate(value?:string|null){return value?new Date(value).toISOString().slice(0,16):"";}

export default function AdminMarketing(){
  const {currentUser,loading}=useAuth(); const [authorized,setAuthorized]=useState<boolean|null>(null); const [tab,setTab]=useState<Kind>("banner"); const [items,setItems]=useState<Asset[]>([]); const [draft,setDraft]=useState<Omit<Asset,"id">|Asset>(empty("banner")); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  useEffect(()=>{if(!currentUser)return setAuthorized(false);currentUser.getIdTokenResult().then(t=>setAuthorized(t.claims.role==="admin"));},[currentUser]);
  const request=useCallback(async(method="GET",body?:object)=>{if(!currentUser)throw new Error("Sesión no disponible.");const token=await currentUser.getIdToken();const response=await fetch("/api/admin/marketing",{method,headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});const data=await response.json();if(!response.ok)throw new Error(data.error||"No fue posible completar la acción.");return data;},[currentUser]);
  const load=useCallback(async()=>{try{const data=await request();setItems([...data.banners,...data.promotions]);setError("");}catch(e){setError(e instanceof Error?e.message:"Error inesperado.");}},[request]);
  useEffect(()=>{if(authorized)load();},[authorized,load]);
  function switchTab(kind:Kind){setTab(kind);setDraft(empty(kind));}
  async function upload(file:File,field:"imageUrl"|"mobileImageUrl"|"videoUrl"|"mobileVideoUrl"|"posterUrl"){
    const isVideo=field.toLowerCase().includes("video"); const limit=isVideo?40*1024*1024:8*1024*1024;
    if(file.size>limit)throw new Error(isVideo?"El video supera 40 MB.":"La imagen supera 8 MB.");
    if(isVideo&&!file.type.startsWith("video/"))throw new Error("Seleccione un archivo de video.");
    if(!isVideo&&!file.type.startsWith("image/"))throw new Error("Seleccione una imagen.");
    const clean=file.name.replace(/[^a-z0-9._-]+/gi,"-").toLowerCase(); const storage=getStorage(app); const target=ref(storage,`marketing/${tab}/${Date.now()}-${clean}`); await uploadBytes(target,file,{contentType:file.type}); const url=await getDownloadURL(target); setDraft(current=>({...current,[field]:url}));
  }
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);try{const body={...draft,kind:tab};await request("id" in draft?"PATCH":"POST",body);await load();setDraft(empty(tab));setError("");}catch(e){setError(e instanceof Error?e.message:"No fue posible guardar.");}finally{setBusy(false);}}
  async function toggle(item:Asset){setBusy(true);try{await request("PATCH",{...item,kind:item.kind,active:item.active===false});await load();}catch(e){setError(e instanceof Error?e.message:"No fue posible cambiar el estado.");}finally{setBusy(false);}}
  if(loading||authorized===null)return <main className={styles.state}>Verificando acceso…</main>;
  if(!authorized)return <main className={styles.state}><h1>Acceso reservado</h1><Link href="/my-account">Iniciar sesión</Link></main>;
  const shown=items.filter(item=>item.kind===tab);
  return <><Head><title>Banners y promociones | TECPOINT</title><meta name="robots" content="noindex,nofollow"/></Head><main className={styles.page}>
    <header><div><Link href="/admin">← Panel central</Link><p>CONTENIDO COMERCIAL</p><h1>Banners y videos.</h1></div><div className={styles.tabs}><button className={tab==="banner"?styles.selected:""} onClick={()=>switchTab("banner")}>Portada</button><button className={tab==="promotion"?styles.selected:""} onClick={()=>switchTab("promotion")}>Promoción flash</button></div></header>
    {error&&<div className={styles.error}>{error}</div>}
    <section className={styles.workspace}><form onSubmit={submit}><div className={styles.formTitle}><span>{"id" in draft?"EDITAR":"NUEVO"}</span><h2>{tab==="banner"?"Banner de portada":"Promoción al ingresar"}</h2></div>
      <label>Título<input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} required/></label><label>Subtítulo<input value={draft.subtitle||""} onChange={e=>setDraft({...draft,subtitle:e.target.value})}/></label>
      <label>Formato<select value={draft.mediaType} onChange={e=>setDraft({...draft,mediaType:e.target.value as "image"|"video"})}><option value="image">Imagen</option><option value="video">Video</option></select></label><label>Orden<input type="number" value={draft.sortOrder||0} onChange={e=>setDraft({...draft,sortOrder:Number(e.target.value)})}/></label>
      {draft.mediaType==="image"?<><Upload label="Imagen escritorio" accept="image/*" value={draft.imageUrl} onFile={f=>upload(f,"imageUrl")} onUrl={v=>setDraft({...draft,imageUrl:v})}/><Upload label="Imagen celular" accept="image/*" value={draft.mobileImageUrl} onFile={f=>upload(f,"mobileImageUrl")} onUrl={v=>setDraft({...draft,mobileImageUrl:v})}/></>:<><Upload label="Video escritorio" accept="video/*" value={draft.videoUrl} onFile={f=>upload(f,"videoUrl")} onUrl={v=>setDraft({...draft,videoUrl:v})}/><Upload label="Video celular" accept="video/*" value={draft.mobileVideoUrl} onFile={f=>upload(f,"mobileVideoUrl")} onUrl={v=>setDraft({...draft,mobileVideoUrl:v})}/><Upload label="Portada del video" accept="image/*" value={draft.posterUrl} onFile={f=>upload(f,"posterUrl")} onUrl={v=>setDraft({...draft,posterUrl:v})}/></>}
      <label>Enlace del botón<input value={draft.linkUrl||""} onChange={e=>setDraft({...draft,linkUrl:e.target.value})} placeholder="/shop o https://..."/></label><label>Texto del botón<input value={draft.cta||""} onChange={e=>setDraft({...draft,cta:e.target.value})}/></label><label>Texto alternativo<input value={draft.alt||""} onChange={e=>setDraft({...draft,alt:e.target.value})}/></label>
      <label>Inicio<input type="datetime-local" value={localDate(draft.startsAt)} onChange={e=>setDraft({...draft,startsAt:e.target.value?new Date(e.target.value).toISOString():null})}/></label><label>Final<input type="datetime-local" value={localDate(draft.endsAt)} onChange={e=>setDraft({...draft,endsAt:e.target.value?new Date(e.target.value).toISOString():null})}/></label>
      <label className={styles.check}><input type="checkbox" checked={draft.artworkOnly||false} onChange={e=>setDraft({...draft,artworkOnly:e.target.checked})}/>La imagen ya contiene todos los textos</label><label className={styles.check}><input type="checkbox" checked={draft.active!==false} onChange={e=>setDraft({...draft,active:e.target.checked})}/>Activo</label><button disabled={busy}>{busy?"Guardando…":"Guardar contenido"}</button>{"id" in draft&&<button type="button" className={styles.secondary} onClick={()=>setDraft(empty(tab))}>Cancelar edición</button>}
    </form><div className={styles.list}><div><span>PUBLICADOS Y PROGRAMADOS</span><h2>{shown.length} piezas</h2></div>{shown.map(item=><article key={item.id}><Preview item={item}/><div><small>{item.mediaType||"image"} · orden {item.sortOrder||0}</small><h3>{item.title}</h3><p>{item.subtitle}</p><div className={styles.actions}><button onClick={()=>setDraft(item)}>Editar</button><button onClick={()=>toggle(item)}>{item.active===false?"Activar":"Pausar"}</button></div></div></article>)}</div></section>
  </main></>;
}

function Upload({label,accept,value,onFile,onUrl}:{label:string;accept:string;value?:string;onFile:(file:File)=>Promise<void>;onUrl:(value:string)=>void}){const [uploading,setUploading]=useState(false);return <label>{label}<input type="file" accept={accept} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setUploading(true);try{await onFile(file);}finally{setUploading(false);}}}/><input value={value||""} onChange={e=>onUrl(e.target.value)} placeholder={uploading?"Subiendo…":"URL del archivo"}/></label>}
function Preview({item}:{item:Asset}){return <div className={styles.preview} style={{position:"relative"}}>{item.mediaType==="video"&&item.videoUrl?<video src={item.videoUrl} poster={item.posterUrl} muted controls preload="metadata"/>:item.imageUrl?<Image src={item.imageUrl} alt={item.alt||item.title} fill unoptimized sizes="210px"/>:<span>Sin archivo</span>}</div>}
