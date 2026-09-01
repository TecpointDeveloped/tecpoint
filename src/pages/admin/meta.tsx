import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { isAdminEmail } from "@/lib/adminAccess";
import styles from "@/styles/adminMeta.module.css";

type Ad = { id: string; name?: string; campaign?: { name?: string }; creative?: { title?: string; body?: string; thumbnail_url?: string }; metrics: { impressions: number; reach: number; clicks: number; spend: number; results: number; ctr: number; costPerResult: number | null } };
type Post = { id: string; message?: string; created_time?: string; permalink_url?: string; full_picture?: string; metrics: { likes: number; comments: number; shares: number; score: number } };
type Dashboard = { connected: boolean; missing?: string[]; error?: string; ads?: Ad[]; posts?: Post[]; updatedAt?: string; version?: string };

const money = (value: number) => new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL" }).format(value);
const number = (value: number) => new Intl.NumberFormat("es-HN").format(value);

export default function MetaAdmin() {
  const { currentUser, loading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [data, setData] = useState<Dashboard | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAuthorized(isAdminEmail(currentUser?.email));
  }, [currentUser]);

  const load = useCallback(async () => {
    if (!currentUser) return;
    setBusy(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/meta", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      setData(result);
    } finally {
      setBusy(false);
    }
  }, [currentUser]);

  useEffect(() => { if (authorized) load(); }, [authorized, load]);
  const winner = useMemo(() => data?.ads?.[0], [data]);

  if (loading || authorized === null) return <main className={styles.state}>Verificando acceso…</main>;
  if (!authorized) return <main className={styles.state}><h1>Acceso reservado</h1><Link href="/my-account">Iniciar sesión</Link></main>;

  return <><Head><title>Meta Ads | Administración TECPOINT</title><meta name="robots" content="noindex,nofollow" /></Head><main className={styles.page}>
    <header><div><Link href="/admin">← Panel central</Link><p>PUBLICIDAD Y CONTENIDO</p><h1>Meta Ads.</h1></div><button onClick={load} disabled={busy}>{busy ? "Actualizando…" : "Actualizar datos"}</button></header>

    {!data ? <section className={styles.state}>Cargando información de Meta…</section> : !data.connected ? <section className={styles.connection}>
      <span>CONEXIÓN PENDIENTE</span><h2>El panel está listo para conectarse con Meta.</h2>
      <p>{data.error || "Faltan credenciales privadas del sistema de Meta en Vercel."}</p>
      {data.missing?.length ? <div>{data.missing.map((item) => <code key={item}>{item}</code>)}</div> : null}
      <small>Las credenciales se guardan únicamente en el servidor y nunca aparecen en el navegador ni en la página pública.</small>
    </section> : <>
      <section className={styles.summary}>
        <article><span>ANUNCIOS ACTIVOS</span><strong>{data.ads?.length || 0}</strong><small>Consultados directamente desde Meta</small></article>
        <article><span>INVERSIÓN · 30 DÍAS</span><strong>{money(data.ads?.reduce((sum, ad) => sum + ad.metrics.spend, 0) || 0)}</strong><small>Solo anuncios activos</small></article>
        <article><span>RESULTADOS</span><strong>{number(data.ads?.reduce((sum, ad) => sum + ad.metrics.results, 0) || 0)}</strong><small>Compras, leads o conversaciones reportadas</small></article>
      </section>

      <section className={styles.block}><div className={styles.heading}><div><p>RENDIMIENTO</p><h2>Anuncios activos.</h2></div><span>Últimos 30 días · {data.updatedAt ? new Date(data.updatedAt).toLocaleString("es-HN") : ""}</span></div>
        {winner && <article className={styles.winner}><span>MEJOR RESULTADO ACTUAL</span><h3>{winner.name}</h3><p>{winner.campaign?.name}</p><div><b>{winner.metrics.results} resultados</b><b>{winner.metrics.ctr.toFixed(2)}% CTR</b><b>{money(winner.metrics.spend)} invertidos</b></div></article>}
        <div className={styles.ads}>{data.ads?.map((ad, index) => <article key={ad.id}>
          <div className={styles.adImage} style={ad.creative?.thumbnail_url ? { backgroundImage: `url(${ad.creative.thumbnail_url})`, backgroundPosition: "center", backgroundSize: "cover", backgroundRepeat: "no-repeat" } : undefined}>{!ad.creative?.thumbnail_url && <span>{String(index + 1).padStart(2, "0")}</span>}</div>
          <div><small>{ad.campaign?.name || "Campaña"}</small><h3>{ad.name || ad.creative?.title || "Anuncio"}</h3><p>{ad.creative?.body || "Sin texto disponible."}</p></div>
          <dl><div><dt>Resultados</dt><dd>{number(ad.metrics.results)}</dd></div><div><dt>CTR</dt><dd>{ad.metrics.ctr.toFixed(2)}%</dd></div><div><dt>Alcance</dt><dd>{number(ad.metrics.reach)}</dd></div><div><dt>Inversión</dt><dd>{money(ad.metrics.spend)}</dd></div><div><dt>Costo/resultado</dt><dd>{ad.metrics.costPerResult === null ? "-" : money(ad.metrics.costPerResult)}</dd></div></dl>
        </article>)}</div>
      </section>

      <section className={styles.block}><div className={styles.heading}><div><p>OPORTUNIDADES</p><h2>Publicaciones para promocionar.</h2></div><span>Ordenadas por interacción y vigencia.</span></div>
        <div className={styles.posts}>{data.posts?.slice(0, 9).map((post, index) => <article key={post.id}>
          <div className={styles.postImage} style={post.full_picture ? { backgroundImage: `url(${post.full_picture})`, backgroundPosition: "center", backgroundSize: "cover", backgroundRepeat: "no-repeat" } : undefined}>{!post.full_picture && <span>TECPOINT</span>}</div>
          <small>{index < 3 ? "RECOMENDADA PARA PROMOCIONAR" : "PUBLICACIÓN ORGÁNICA"}</small>
          <p>{post.message || "Publicación sin texto."}</p>
          <div><b>{post.metrics.likes} Me gusta</b><b>{post.metrics.comments} comentarios</b><b>{post.metrics.shares} compartidos</b></div>
          {post.permalink_url && <a href={post.permalink_url} target="_blank" rel="noreferrer">Abrir en Meta ↗</a>}
        </article>)}</div>
      </section>
    </>}
  </main></>;
}
