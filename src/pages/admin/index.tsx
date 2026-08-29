import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import styles from "@/styles/adminHub.module.css";

const modules = [
  { href: "/admin/productos", label: "Catálogo", title: "Productos y calidad", copy: "Detecte fichas incompletas y duplicados antes de publicarlos." },
  { href: "/admin/mayoreo", label: "Mayoreo", title: "Productos y solicitudes de Mayoreo", copy: "Administre precios, categorías, visibilidad y negocios registrados." },
  { href: "/admin/marketing", label: "Contenido", title: "Banners y promociones", copy: "Suba imágenes o videos, programe fechas y controle el orden de aparición." },
  { href: "/admin/meta", label: "Publicidad", title: "Meta Ads y publicaciones", copy: "Revise anuncios activos, identifique resultados y encuentre publicaciones con potencial para promocionar." },
  { href: "/admin/configuracion", label: "Sistema", title: "Contactos y ubicaciones", copy: "Actualice WhatsApp, Google Maps y confirme el estado de las integraciones." },
  { href: "/admin/comercial", label: "Ventas", title: "Mensajes y pedidos", copy: "Organice conversaciones, asesores y compras en seguimiento." },
  { href: "/admin/codigos", label: "Referidos", title: "Códigos", copy: "Módulo preparado para activarse después de completar el catálogo." },
];

export default function AdminHub() {
  const { currentUser, loading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  useEffect(() => {
    if (!currentUser) return setAuthorized(false);
    currentUser.getIdTokenResult().then((token) => setAuthorized(token.claims.role === "admin"));
  }, [currentUser]);
  if (loading || authorized === null) return <main className={styles.state}>Verificando acceso…</main>;
  if (!authorized) return <main className={styles.state}><h1>Acceso reservado</h1><p>Ingrese con una cuenta administradora de TECPOINT.</p><Link href="/my-account">Iniciar sesión</Link></main>;
  return <><Head><title>Administración | TECPOINT</title><meta name="robots" content="noindex,nofollow" /></Head><main className={styles.page}>
    <header><Image src="/brand/logo-principal.svg" alt="TECPOINT" width={190} height={42}/><div><small>PANEL CENTRAL</small><strong>{currentUser?.displayName || currentUser?.email}</strong></div></header>
    <section className={styles.hero}><p>CONTROL OPERATIVO</p><h1>Todo lo importante, en un solo punto.</h1><span>Revise primero la calidad del catálogo. Los productos incompletos permanecen ocultos para clientes.</span></section>
    <section className={styles.grid}>{modules.map((item, index)=><Link href={item.href} key={item.href}><span>0{index + 1} · {item.label}</span><h2>{item.title}</h2><p>{item.copy}</p><b>Abrir módulo →</b></Link>)}</section>
  </main></>;
}
