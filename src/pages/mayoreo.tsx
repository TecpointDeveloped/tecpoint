import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/database/Config";
import NavbarMenu from "@/components/navbarmenu/page";
import Footer from "@/components/Footer/page";
import { Product } from "@/types/ProductTypes";
import {
  approvedCatalogProducts,
  enrichProduct,
  preferredProductSlug,
  productPromotion,
  isNewProduct,
  productAddedTime,
  publicCatalog,
} from "@/lib/catalog";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";
import styles from "@/styles/mayoreo.module.css";

type Props = { products: Product[]; totalProducts: number; currentPage: number; totalPages: number };

export async function getServerSideProps({ res, query }: { res: { setHeader: (name: string, value: string) => void }; query: { page?: string | string[] } }) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
  try {
    const snapshot = await getDocs(collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string));
    const promotionalProducts = publicCatalog([
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
      .filter((product) => Boolean(product.extradata?.stock && productPromotion(product)))
      .sort((left, right) => {
        const dateDifference = productAddedTime(right) - productAddedTime(left);
        if (dateDifference) return dateDifference;
        const leftPromotion = productPromotion(left);
        const rightPromotion = productPromotion(right);
        return (rightPromotion?.percent || 0) - (leftPromotion?.percent || 0);
      });
    const perPage = 16;
    const requestedPage = Array.isArray(query.page) ? query.page[0] : query.page;
    const totalProducts = promotionalProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / perPage));
    const currentPage = Math.min(totalPages, Math.max(1, Number(requestedPage) || 1));
    const products = promotionalProducts.slice((currentPage - 1) * perPage, currentPage * perPage);
    return { props: { products, totalProducts, currentPage, totalPages } };
  } catch (error) {
    console.error("No fue posible cargar las oportunidades de mayoreo:", error);
    return { props: { products: [], totalProducts: 0, currentPage: 1, totalPages: 1 } };
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

export default function Mayoreo({ products, totalProducts, currentPage, totalPages }: Props) {
  const { wholesaleWhatsApp } = useSiteConfig();
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
            <span>
              Productos con descuentos vigentes y asesoría para confirmar
              inventario, volumen y condiciones comerciales.
            </span>
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
            <strong>15 · 20 · 30</strong>
            <small>POR CIENTO DE DESCUENTO</small>
          </div>
        </header>

        <section className={styles.catalog}>
          <div className={styles.heading}>
            <div>
              <p>PRECIOS PROMOCIONALES</p>
              <h2>Oportunidades disponibles.</h2>
            </div>
            <span>{totalProducts} productos completos con promoción registrada.</span>
          </div>
          {products.length ? (
            <div className={styles.grid}>
              {products.map((product) => {
                const promotion = productPromotion(product);
                if (!promotion) return null;
                return (
                  <article className={styles.card} key={product.id}>
                    <Link className={styles.image} href={`/shop/${preferredProductSlug(product)}`}>
                      <b>−{promotion.percent}%</b>
                      {isNewProduct(product) && <span>Nuevo</span>}
                      <Image
                        src={imageFor(product)}
                        alt={product.producto}
                        fill
                        sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </Link>
                    <div className={styles.info}>
                      <small>{product.marca_producto?.marca || "TECPOINT"} · {product.sku}</small>
                      <h2>{product.producto}</h2>
                      <div className={styles.prices}>
                        <span>{money(promotion.regularPrice)}</span>
                        <strong>{money(promotion.promotionalPrice)}</strong>
                      </div>
                      <p>Precio promocional calculado con el descuento vigente del catálogo.</p>
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
              <Link className={currentPage === 1 ? styles.disabled : ""} href={`/mayoreo?page=${Math.max(1, currentPage - 1)}`}>Anterior</Link>
              <span>Página {currentPage} de {totalPages}</span>
              <Link className={currentPage === totalPages ? styles.disabled : ""} href={`/mayoreo?page=${Math.min(totalPages, currentPage + 1)}`}>Siguiente</Link>
            </nav>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
