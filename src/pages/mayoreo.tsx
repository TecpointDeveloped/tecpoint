import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/database/Config";
import NavbarMenu from "@/components/navbarmenu/page";
import Footer from "@/components/Footer/page";
import { Product } from "@/types/ProductTypes";
import {
  approvedCatalogProducts,
  enrichProduct,
  preferredProductSlug,
  isNewProduct,
  productAddedTime,
  publicCatalog,
} from "@/lib/catalog";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";
import { trackContact } from "@/lib/tracking";
import styles from "@/styles/mayoreo.module.css";
import { validWholesaleAccess, WHOLESALE_COOKIE } from "@/lib/wholesaleAccess.server";
import { productImageFallback } from "@/lib/imageFallback";

type Props = { products: Product[]; totalProducts: number; currentPage: number; totalPages: number; catalogUnlocked: boolean; currentSearch: string };

export async function getServerSideProps({ req, res, query }: { req: { cookies: Record<string, string> }; res: { setHeader: (name: string, value: string) => void }; query: { page?: string | string[]; search?: string | string[] } }) {
  res.setHeader("Cache-Control", "private, no-store");
  const catalogUnlocked = validWholesaleAccess(req.cookies[WHOLESALE_COOKIE]);
  if (!catalogUnlocked) return { props: { products: [], totalProducts: 0, currentPage: 1, totalPages: 1, catalogUnlocked: false, currentSearch: "" } };
  try {
    const snapshot = await getDocs(collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string));
    const currentSearch = String(Array.isArray(query.search) ? query.search[0] : query.search || "").trim();
    const wholesaleProducts = publicCatalog([
      ...snapshot.docs.map((document) => {
        const data = document.data();
        return enrichProduct({
          id: document.id,
          ...data,
          fecha_agregado: data.fecha_agregado?.toDate?.().toISOString() || null,
        } as Product);
      }),
      ...approvedCatalogProducts(),
    ])
      .filter((product) => Boolean(
        (product.extradata?.stock || Boolean(currentSearch)) &&
        Number(product.precio?.mayoreo) > 0 &&
        (product.extradata?.wholesaleEnabled !== false || Boolean(currentSearch)) &&
        (!currentSearch || `${product.producto} ${product.sku} ${product.marca_producto?.marca || ""}`.toLowerCase().includes(currentSearch.toLowerCase())),
      ))
      .sort((left, right) => {
        const dateDifference = productAddedTime(right) - productAddedTime(left);
        if (dateDifference) return dateDifference;
        return String(left.producto).localeCompare(String(right.producto));
      });
    const perPage = 16;
    const requestedPage = Array.isArray(query.page) ? query.page[0] : query.page;
    const totalProducts = wholesaleProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / perPage));
    const currentPage = Math.min(totalPages, Math.max(1, Number(requestedPage) || 1));
    const products = wholesaleProducts.slice((currentPage - 1) * perPage, currentPage * perPage);
    return { props: { products, totalProducts, currentPage, totalPages, catalogUnlocked: true, currentSearch } };
  } catch (error) {
    console.error("No fue posible cargar las oportunidades de mayoreo:", error);
    return { props: { products: [], totalProducts: 0, currentPage: 1, totalPages: 1, catalogUnlocked: true, currentSearch: "" } };
  }
}

function imageFor(product: Product) {
  return product.imagenes?.imagen_01?.img || Object.values(product.imagenes || {})[0]?.img || "/default-product.png";
}

function money(value: number) {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Mayoreo({ products, totalProducts, currentPage, totalPages, catalogUnlocked, currentSearch }: Props) {
  const router = useRouter();
  const { wholesaleWhatsApp } = useSiteConfig();
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("sending");
    setFormMessage("");
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/wholesale-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No fue posible enviar sus datos.");
      form.reset();
      setFormState("success");
      setFormMessage("¡Gracias! El equipo de Mayoreo recibió sus datos y podrá contactarle.");
      trackContact("Formulario mayoreo");
      await router.push("/mayoreo");
    } catch (error) {
      setFormState("error");
      setFormMessage(error instanceof Error ? error.message : "No fue posible enviar sus datos.");
    }
  }
  return (
    <>
      <Head>
        <title>Mayoreo y promociones | TECPOINT Honduras</title>
        <meta name="description" content="Consulte productos TECPOINT con promociones vigentes y atención especializada para compras por volumen en Honduras." />
        <link rel="canonical" href="https://tecpoint.ws/mayoreo" />
      </Head>
      <NavbarMenu />
      <main className={styles.page}>
        <header className={styles.hero}>
          <div>
            <p>TECPOINT MAYOREO</p>
            <h1>Más oportunidad para su negocio.</h1>
            <span>Registre sus datos para consultar el catálogo, precios de mayoreo, inventario y condiciones comerciales.</span>
            <a
              href={whatsappLink(wholesaleWhatsApp, "Hola, deseo recibir atención de TECPOINT Mayoreo.")}
              target="_blank"
              rel="noreferrer"
            >
              Hablar con Mayoreo ↗
            </a>
          </div>
          <div className={styles.heroMark} aria-hidden="true">
            <Image src="/brand/isologo.svg" alt="" width={190} height={190} priority />
            <strong>PRECIO</strong>
            <small>EXCLUSIVO PARA NEGOCIOS REGISTRADOS</small>
          </div>
        </header>

        <section className={styles.leadSection} aria-labelledby="solicitud-mayoreo">
          <div className={styles.leadCopy}>
            <p>ATENCIÓN PARA NEGOCIOS</p>
            <h2 id="solicitud-mayoreo">Conversemos sobre su tienda.</h2>
            <span>
              Déjenos sus datos y un asesor podrá orientarle sobre disponibilidad,
              compras por volumen y oportunidades vigentes.
            </span>
          </div>
          <form className={styles.leadForm} onSubmit={submitLead}>
            <label>
              Nombre
              <input name="name" autoComplete="name" required maxLength={90} placeholder="Su nombre" />
            </label>
            <label>
              WhatsApp
              <input name="whatsapp" autoComplete="tel" inputMode="tel" required maxLength={24} placeholder="Ej. 9819-1003" />
            </label>
            <label>
              Correo
              <input name="email" type="email" autoComplete="email" required maxLength={120} placeholder="correo@tienda.com" />
            </label>
            <label>
              Nombre de tienda
              <input name="storeName" autoComplete="organization" required maxLength={120} placeholder="Nombre de su negocio" />
            </label>
            <input className={styles.honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <button disabled={formState === "sending"} type="submit">
              {formState === "sending" ? "Enviando…" : "Solicitar información"}
            </button>
            {formMessage && (
              <p className={formState === "success" ? styles.success : styles.error} role="status">
                {formMessage}
              </p>
            )}
          </form>
        </section>

        {!catalogUnlocked ? (
          <section className={styles.lockedCatalog} aria-labelledby="catalogo-protegido">
            <Image src="/brand/isologo.svg" alt="" width={88} height={88} />
            <p>CATÁLOGO PROTEGIDO</p>
            <h2 id="catalogo-protegido">Complete el formulario para ver productos y precios de mayoreo.</h2>
            <span>Los precios mayoristas no se muestran públicamente. Después de registrar sus datos, el catálogo se habilitará en esta misma página.</span>
            <a href="#solicitud-mayoreo">Completar registro ↑</a>
          </section>
        ) : <section className={styles.catalog}>
          <div className={styles.heading}>
            <div>
              <p>CATÁLOGO PARA NEGOCIOS</p>
              <h2>Productos de mayoreo.</h2>
            </div>
            <span>{totalProducts} productos completos con precio mayorista registrado.</span>
          </div>
          <form className={styles.catalogSearch} method="get">
            <label htmlFor="mayoreo-search">Buscar producto, marca o SKU</label>
            <div><input id="mayoreo-search" name="search" defaultValue={currentSearch} placeholder="Ej. cargador Apple o AS-36388"/><button type="submit">Buscar</button></div>
            {currentSearch && <Link href="/mayoreo">Mostrar disponibles</Link>}
          </form>
          {products.length ? (
            <div className={styles.grid}>
              {products.map((product) => {
                const wholesalePrice = Number(product.precio.mayoreo);
                const retailPrice = Number(product.precio.detalle);
                const savings = retailPrice > wholesalePrice ? Math.round((1 - wholesalePrice / retailPrice) * 100) : 0;
                return (
                  <article className={styles.card} key={product.id}>
                    <Link className={styles.image} href={`/shop/${preferredProductSlug(product)}`}>
                      {savings > 0 && <b>AHORRE {savings}%</b>}
                      {isNewProduct(product) && <span>Nuevo</span>}
                      {product.extradata?.stock === true && Number(product.extradata?.inventoryQuantity || 0) <= 5 && <em>Últimas piezas</em>}
                      {product.extradata?.stock !== true && <em>Agotado</em>}
                      <Image
                        src={imageFor(product)}
                        alt={product.producto}
                        fill
                        sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        onError={productImageFallback}
                      />
                    </Link>
                    <div className={styles.info}>
                      <small>{product.marca_producto?.marca || "TECPOINT"} · {product.sku}</small>
                      <h2>{product.producto}</h2>
                      <div className={styles.prices}>
                        <strong>{money(wholesalePrice)}</strong>
                      </div>
                      <p>Precio de mayoreo. Confirme cantidad mínima, existencia y condiciones con un asesor.</p>
                      <div className={styles.actions}>
                        <Link href={`/shop/${preferredProductSlug(product)}`}>Ver producto</Link>
                        <a
                          href={whatsappLink(wholesaleWhatsApp, `Hola, deseo cotizar por volumen ${product.producto} (${product.sku}).`)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Cotizar ↗
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <h2>Estamos actualizando las oportunidades.</h2>
              <p>Consulte con nuestro equipo de Mayoreo para conocer disponibilidad actual.</p>
            </div>
          )}
          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Páginas de promociones">
              <Link className={currentPage === 1 ? styles.disabled : ""} href={`/mayoreo?page=${Math.max(1, currentPage - 1)}&search=${encodeURIComponent(currentSearch)}`}>Anterior</Link>
              <span>Página {currentPage} de {totalPages}</span>
              <Link className={currentPage === totalPages ? styles.disabled : ""} href={`/mayoreo?page=${Math.min(totalPages, currentPage + 1)}&search=${encodeURIComponent(currentSearch)}`}>Siguiente</Link>
            </nav>
          )}
        </section>}
      </main>
      <Footer />
    </>
  );
}
