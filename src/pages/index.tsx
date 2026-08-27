import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../database/Config";
import { Product } from "@/types/ProductTypes";
import NavbarMenu from "@/components/navbarmenu/page";
import Footer from "@/components/Footer/page";
import styles from "@/styles/home2026.module.css";
import currentCatalog from "@/data/current-catalog-w31.json";
import {
  enrichProduct,
  approvedCatalogProducts,
  publicCatalog,
  OFFICIAL_CATEGORIES,
  preferredProductSlug,
  productPromotion,
} from "@/lib/catalog";
import { brandAssets } from "@/lib/brands";
import { ArrowUpRight, MapPin, MessageCircle, Star } from "lucide-react";
import { FlashPromotion, HomepageBannerCarousel, type MarketingAsset } from "@/components/MarketingContent/page";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";
import dynamic from "next/dynamic";

const AppIntro = dynamic(() => import("@/components/AppIntro/page"), {
  ssr: false,
});

type MarketingDoc = Omit<MarketingAsset, "id"> & {
  active?: boolean;
  sortOrder?: number;
  startsAt?: { toDate?: () => Date };
  endsAt?: { toDate?: () => Date };
};

const CURRENT_CAMPAIGN_BANNERS: MarketingAsset[] = [
  ["xo-main", "XO: nuevos ingresos", "XO BANNER NUEVO.png", "XO"],
  ["deken-june", "Deken: protección actual", "BANNER DEKEN JUNIO2026.png", "Deken"],
  ["xo-02", "XO: tecnología para su día", "XO BANNER NUEVO 2.png", "XO"],
  ["xo-03", "XO: conecte con lo nuevo", "XO BANNER NUEVO 3.png", "XO"],
  ["hoco-01", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 1.png", "Hoco"],
  ["hoco-02", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 2.png", "Hoco"],
  ["hoco-03", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 3.png", "Hoco"],
  ["hoco-04", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 4.png", "Hoco"],
  ["hoco-05", "HOCO: nuevos ingresos", "HOCO NUEVOS INGRESOS 5.png", "Hoco"],
  ["hoco-product", "HOCO: producto nuevo", "ho-10132 banner hoco prooducto nuevo.png", "Hoco"],
].map(([id, title, fileName, brand]) => ({
  id,
  title,
  imageUrl: `/images/banners-current/${fileName}`,
  linkUrl: `/shop?page=1&brand=${encodeURIComponent(brand)}`,
  cta: "Ver productos",
  alt: title,
  artworkOnly: true,
}));

const LOCATION_IMAGES = [
  {
    src: "/images/locations/plaza-carolina.webp",
    alt: "Fachada del punto TECPOINT en Plaza Carolina",
  },
  {
    src: "/images/locations/portal-viera.webp",
    alt: "Fachada del punto TECPOINT en Portal de Viera",
  },
  {
    src: "/brand/signal-field.svg",
    alt: "Sistema gráfico oficial de TECPOINT",
  },
];

function activeMarketingAssets(docs: Awaited<ReturnType<typeof getDocs>>["docs"]) {
  const now = Date.now();
  return docs
    .map((doc) => {
      const data = doc.data() as MarketingDoc;
      const startsAt = data.startsAt?.toDate?.()?.getTime?.() || 0;
      const endsAt = data.endsAt?.toDate?.()?.getTime?.() || Number.MAX_SAFE_INTEGER;
      return { id: doc.id, ...data, startsAt, endsAt };
    })
    .filter((item) => item.active !== false && (item.imageUrl || item.videoUrl) && item.startsAt <= now && item.endsAt >= now)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
}

export async function getServerSideProps({ res }: { res: { setHeader: (name: string, value: string) => void } }) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
  const [productDocs, bannerDocs, promotionDocs, settingsDoc] = await Promise.all([
    getDocs(collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string)),
    getDocs(collection(db, "site_banners")).catch(() => null),
    getDocs(collection(db, "flash_promotions")).catch(() => null),
    getDoc(doc(db, "site_settings", "general")).catch(() => null),
  ]);

  const completeProducts = publicCatalog([...productDocs.docs.map<Product>((doc) => {
    const data = doc.data();
    return enrichProduct({
      id: doc.id,
      ...data,
      fecha_agregado: data.fecha_agregado?.toDate
        ? data.fecha_agregado.toDate().toISOString()
        : null,
    } as Product);
  }), ...approvedCatalogProducts()])
    .filter((product) =>
      currentCatalog.records.some(
        (item) => item.sku === String(product.sku || "").trim(),
      ),
    )
    .sort((a, b) => {
      const dateA = a.fecha_agregado
        ? new Date(a.fecha_agregado).getTime()
        : 0;
      const dateB = b.fecha_agregado
        ? new Date(b.fecha_agregado).getTime()
        : 0;
      return dateB - dateA;
    })
    .filter((product) => Boolean(product.extradata?.stock));

  const products = completeProducts.slice(0, 8);
  const wholesalePromotions = completeProducts
    .filter((product) => Boolean(productPromotion(product)))
    .slice(0, 4);

  return {
    props: {
      products,
      wholesalePromotions,
      rockSpaceCount: currentCatalog.records.filter(
        (item) => item.brand === "Rock Space" && item.stock > 0,
      ).length,
      homepageBanners: activeMarketingAssets(bannerDocs?.docs || []),
      flashPromotion: activeMarketingAssets(promotionDocs?.docs || [])[0] || null,
      googleSiteVerification:
        settingsDoc?.data()?.googleSiteVerification ||
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
        "rGu_PQAnMb87mm_8dS9oWQPpkuhg8eUwEuC8-3xKiDc",
    },
  };
}

function imageFor(product: Product) {
  return (
    product.imagenes?.imagen_01?.img ||
    Object.values(product.imagenes || {})[0]?.img ||
    "/default-product.png"
  );
}

function priceFor(product: Product) {
  const value = Number(product.precio?.detalle || 0);
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home({
  products,
  wholesalePromotions,
  rockSpaceCount,
  homepageBanners,
  flashPromotion,
  googleSiteVerification,
}: {
  products: Product[];
  wholesalePromotions: Product[];
  rockSpaceCount: number;
  homepageBanners: MarketingAsset[];
  flashPromotion: MarketingAsset | null;
  googleSiteVerification: string;
}) {
  const { locations, onlineWhatsApp, wholesaleWhatsApp } = useSiteConfig();
  const selectedProducts = products
    .filter(
      (product) =>
        product.producto &&
        product.slug &&
        product.precio?.detalle &&
        product.extradata?.stock &&
        imageFor(product) !== "/default-product.png",
    )
    .slice(0, 8);

  return (
    <>
      <AppIntro />
      <Head>
        <title>TECPOINT | Tecnología bien elegida</title>
        <meta
          name="description"
          content="Accesorios tecnológicos seleccionados, compatibilidad clara y atención cercana. Compra al detalle y al mayoreo en Honduras."
        />
        {googleSiteVerification && (
          <meta
            name="google-site-verification"
            content={googleSiteVerification}
          />
        )}
        <meta
          name="keywords"
          content="accesorios tecnológicos Honduras, cargadores, audífonos, power banks, protección de pantalla, TECPOINT"
        />
        <meta property="og:url" content="https://tecpoint.ws" />
        <meta property="og:title" content="TECPOINT | Tecnología bien elegida" />
        <meta
          property="og:description"
          content="Productos seleccionados y una experiencia cuidada para comprar tecnología con confianza."
        />
        <meta property="og:image" content="https://tecpoint.ws/images/og_image.png" />
        <meta property="og:locale" content="es_HN" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://tecpoint.ws/" />
        <link rel="alternate" hrefLang="es-HN" href="https://tecpoint.ws/" />
        <link rel="alternate" hrefLang="x-default" href="https://tecpoint.ws/" />
        <link rel="icon" href="/brand/isologo.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://tecpoint.ws/#organization",
                  name: "TECPOINT",
                  url: "https://tecpoint.ws/",
                  logo: "https://tecpoint.ws/brand/logo-horizontal.svg",
                  sameAs: [
                    "https://www.instagram.com/tecpoint_distribucion/",
                    "https://www.facebook.com/Tecpoint.Distribucion/",
                    "https://www.tiktok.com/@tecpoint.ws",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://tecpoint.ws/#website",
                  url: "https://tecpoint.ws/",
                  name: "TECPOINT",
                  publisher: { "@id": "https://tecpoint.ws/#organization" },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://tecpoint.ws/shop?search={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Store",
                  name: "TECPOINT Plaza Carolina",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "San Pedro Sula",
                    streetAddress: "Plaza Carolina, segundo nivel, bulevar Mackay",
                    addressCountry: "HN",
                  },
                  telephone: "+50493385732",
                  parentOrganization: { "@id": "https://tecpoint.ws/#organization" },
                },
                {
                  "@type": "Store",
                  name: "TECPOINT Portal de Viera",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Tegucigalpa",
                    streetAddress: "Portal de Viera, tercer nivel, km 3 carretera a El Hatillo",
                    addressCountry: "HN",
                  },
                  telephone: "+50495200523",
                  parentOrganization: { "@id": "https://tecpoint.ws/#organization" },
                },
              ],
            }),
          }}
        />
      </Head>

      <div className={styles.announcement}>
        <span>ENVÍO GRATIS EN COMPRAS MAYORES A L 1,500</span>
        <span>ENVÍOS NACIONALES · PICK UP DISPONIBLE</span>
      </div>

      <NavbarMenu />

      <HomepageBannerCarousel
        assets={[
          ...homepageBanners,
          ...CURRENT_CAMPAIGN_BANNERS,
        ]}
      />
      <FlashPromotion asset={flashPromotion} />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>EL PUNTO DE LA TECNOLOGÍA</p>
            <h1>
              Tecnología
              <br />
              <span>bien elegida.</span>
            </h1>
            <p className={styles.lead}>
              Productos seleccionados, compatibilidad clara y una experiencia
              cuidada para comprar con confianza.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href="/shop">
                Explorar productos
              </Link>
              <a className={styles.secondaryButton} href="#experiencia">
                Conocer TECPOINT
              </a>
            </div>
            <div className={styles.proof}>
              <div><strong>3</strong><span>puntos de atención</span></div>
              <div><strong>HN</strong><span>cobertura nacional</span></div>
              <div><strong>+1,400</strong><span>productos registrados</span></div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <Image
              src="/images/producto-editorial-2026.webp"
              alt="Accesorios tecnológicos seleccionados por TECPOINT"
              fill
              priority
              quality={85}
              sizes="(max-width: 900px) 100vw, 1200px"
            />
            <div className={styles.heroSignal} aria-hidden="true">
              <Image src="/brand/isologo.svg" alt="" width={190} height={190} />
            </div>
            <div className={styles.heroMotion} aria-hidden="true">
              <span>CARGA</span>
              <span>PROTEGE</span>
              <span>CONECTA</span>
            </div>
            <div className={styles.heroSeal}>
              <Image src="/brand/isologo.svg" alt="" width={62} height={62} />
              <span>SELECCIÓN TECPOINT</span>
            </div>
            <div className={styles.heroTicker} aria-hidden="true">
              <span>PRECISIÓN</span>
              <span>UTILIDAD</span>
              <span>DISEÑO</span>
              <span>TECNOLOGÍA QUE SE SIENTE</span>
            </div>
          </div>
        </section>

        <section className={styles.categories}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>ENCUENTRE SU PUNTO</p>
              <h2>Comprar por necesidad.</h2>
            </div>
            <p>
              Una navegación sencilla que comienza por lo que usted necesita
              resolver.
            </p>
          </div>
          <div className={styles.categoryGrid}>
            {OFFICIAL_CATEGORIES.map((category, index) => (
              <Link
                className={styles.categoryCard}
                href={`/categories/${category.slug}`}
                key={category.slug}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>↘</b>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <strong>Explorar →</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.brands} aria-labelledby="brands-title">
          <div className={styles.brandIntro}>
            <p className={styles.eyebrow}>MARCAS SELECCIONADAS</p>
            <h2 id="brands-title">Tecnología con respaldo.</h2>
            <p>
              Explore el catálogo por marca y encuentre opciones compatibles
              con su dispositivo y su forma de usar la tecnología.
            </p>
          </div>
          <div className={styles.brandGrid}>
            {brandAssets.map((brand) => (
              <Link
                href={`/shop?page=1&brand=${encodeURIComponent(brand.name)}`}
                className={styles.brandCard}
                key={brand.name}
                data-brand={brand.name}
                aria-label={`Ver productos ${brand.name}`}
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={180}
                  height={70}
                />
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.products}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>SELECCIÓN ACTUAL</p>
              <h2>Productos que elevan su día.</h2>
            </div>
            <Link className={styles.darkButton} href="/shop">
              Ver catálogo completo
            </Link>
          </div>
          <div className={styles.productGrid}>
            {selectedProducts.map((product, index) => (
              <article className={styles.productCard} key={product.id}>
                <Link
                  className={styles.productImage}
                  href={`/shop/${preferredProductSlug(product)}`}
                  aria-label={`Ver ${product.producto}`}
                >
                  {index < 2 && <span>Selección</span>}
                  <Image
                    src={imageFor(product)}
                    alt={product.producto}
                    fill
                    sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  />
                </Link>
                <div className={styles.productInfo}>
                  <small>
                    {product.marca_producto?.marca || "TECPOINT"} · {product.sku}
                  </small>
                  <h3>{product.producto}</h3>
                  <div>
                    <strong>{priceFor(product)}</strong>
                    <Link href={`/shop/${preferredProductSlug(product)}`}>Ver producto +</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.rockSpace} aria-labelledby="rock-space-title">
          <div className={styles.rockSpaceCopy}>
            <Image
              src="/logos/rock-space-white.png"
              alt="Rock Space"
              width={210}
              height={76}
            />
            <p className={`${styles.eyebrow} ${styles.light}`}>
              CENTRO AUTORIZADO DE PROTECCIÓN
            </p>
            <h2 id="rock-space-title">
              Protección hecha
              <br />
              <span>para su dispositivo.</span>
            </h2>
            <p>
              Láminas, plotters y suministros Rock Space para una instalación
              precisa. Actualmente contamos con {rockSpaceCount} referencias
              disponibles.
            </p>
            <Link
              className={styles.rockSpaceButton}
              href="/shop?page=1&brand=Rock%20Space&search="
            >
              Explorar Rock Space
            </Link>
          </div>
          <div className={styles.rockSpaceMotion} aria-hidden="true">
            <div className={styles.motionOrb} />
            <div className={styles.motionFilm}>
              <span>SELF HEALING</span>
              <span>PRIVACY</span>
              <span>MATTE</span>
              <span>UV HD</span>
              <span>SELF HEALING</span>
            </div>
            <div className={styles.motionPhone}>
              <div />
            </div>
            <div className={styles.motionGrid} />
          </div>
        </section>

        <section className={styles.experience} id="experiencia">
          <div className={styles.experienceImage}>
            <Image
              src="/images/campaign-next-generation-devices.webp"
              alt="Dispositivos móviles premium de nueva generación en un ambiente lifestyle"
              fill
              quality={85}
              sizes="(max-width: 900px) 100vw, 1200px"
            />
          </div>
          <div className={styles.experienceCopy}>
            <p className={`${styles.eyebrow} ${styles.light}`}>SIEMPRE ACTUALIZADOS</p>
            <h2>Accesorios para todos.</h2>
            <p>
              Desde los formatos clásicos hasta los plegables más recientes:
              encuentre protección, energía y audio para acompañar su tecnología.
              Si no está seguro de la compatibilidad, un asesor le orientará sin presión.
            </p>
            <ol>
              <li><span>01</span><div><strong>Selección con criterio</strong><p>Productos elegidos por utilidad, calidad y diseño.</p></div></li>
              <li><span>02</span><div><strong>Confianza al elegir</strong><p>Información y compatibilidad presentadas con claridad.</p></div></li>
              <li><span>03</span><div><strong>Experiencia cuidada</strong><p>Atención cercana antes, durante y después de la compra.</p></div></li>
            </ol>
          </div>
        </section>

        <section className={styles.advisor}>
          <div className={styles.advisorCopy}>
            <p className={`${styles.eyebrow} ${styles.light}`}>COMPATIBILIDAD PRIMERO</p>
            <h2>¿No sabe cuál elegir?</h2>
            <p>
              Envíenos el modelo exacto de su dispositivo. Un asesor le ayudará
              a identificar la opción adecuada.
            </p>
          </div>
          <div className={styles.advisorAction}>
            <div className={styles.advisorMark}>
              <Image src="/brand/isologo.svg" alt="" width={120} height={120} />
            </div>
            <span>ASESORÍA PERSONALIZADA</span>
            <strong>Confirme antes de comprar.</strong>
            <a
              className={styles.advisorButton}
              href={whatsappLink(onlineWhatsApp, "Hola, necesito ayuda para elegir un accesorio compatible.")}
              target="_blank"
              rel="noreferrer"
            >
              Consultar compatibilidad <b>↗</b>
            </a>
          </div>
        </section>

        <section className={styles.wholesale}>
          <div className={styles.wholesaleCopy}>
            <p className={styles.eyebrow}>TECPOINT MAYOREO</p>
            <h2>Inventario que impulsa su negocio.</h2>
            <p>
              Atención especializada para comercios y distribuidores que buscan
              variedad, disponibilidad y acompañamiento comercial.
            </p>
            <div><span>Asesoría comercial</span><span>Catálogo amplio</span><span>Pick up en SPS</span></div>
            <Link
              className={styles.darkButton}
              href="/mayoreo"
            >
              Ver oportunidades
            </Link>
          </div>
          <div className={styles.wholesaleVisual}>
            <Image src="/brand/signal-field.svg" alt="" fill />
            <div>
              <Image src="/brand/isologo.svg" alt="" width={84} height={84} />
              <span>CANAL MAYORISTA</span>
              <strong>+504 9819-1003</strong>
            </div>
          </div>
        </section>

        <section className={styles.wholesaleDeals} aria-labelledby="mayoreo-promociones">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>OPORTUNIDADES ACTUALES</p>
              <h2 id="mayoreo-promociones">Productos con descuento.</h2>
            </div>
            <p>
              Referencias disponibles con precio promocional visible. Para volumen,
              disponibilidad y condiciones comerciales, confirme con Mayoreo.
            </p>
          </div>
          <div className={styles.dealGrid}>
            {wholesalePromotions.map((product) => {
              const promotion = productPromotion(product);
              if (!promotion) return null;
              return (
                <article className={styles.dealCard} key={`mayoreo-${product.id}`}>
                  <Link className={styles.dealImage} href={`/shop/${preferredProductSlug(product)}`}>
                    <span className={styles.discountBadge}>−{promotion.percent}%</span>
                    <Image
                      src={imageFor(product)}
                      alt={product.producto}
                      fill
                      sizes="(max-width: 680px) 100vw, (max-width: 1020px) 50vw, 25vw"
                    />
                  </Link>
                  <div className={styles.dealInfo}>
                    <small>{product.marca_producto?.marca || "TECPOINT"} · {product.sku}</small>
                    <h3>{product.producto}</h3>
                    <div className={styles.dealPrices}>
                      <span>{priceFor({ ...product, precio: { ...product.precio, detalle: promotion.regularPrice } })}</span>
                      <strong>{priceFor({ ...product, precio: { ...product.precio, detalle: promotion.promotionalPrice } })}</strong>
                    </div>
                    <a
                      href={whatsappLink(wholesaleWhatsApp, `Hola, deseo consultar disponibilidad y precio por volumen de ${product.producto} (${product.sku}).`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Consultar con Mayoreo ↗
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
          <Link className={styles.darkButton} href="/mayoreo">
            Ver todos los descuentos
          </Link>
        </section>

        <section className={styles.locations} id="ubicaciones">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>CERCA DE USTED</p>
              <h2>Tres puntos de atención.</h2>
            </div>
            <p>
              Visítenos, solicite pick up o reciba su pedido en cualquier lugar
              de Honduras.
            </p>
          </div>
          <div className={styles.locationGrid}>
            {locations.map((location, index) => (
              <article key={location.name}>
                <div className={styles.locationVisual}>
                  <Image
                    className={styles.locationPhoto}
                    src={LOCATION_IMAGES[index].src}
                    alt={LOCATION_IMAGES[index].alt}
                    fill
                    sizes="(max-width: 680px) 100vw, 33vw"
                  />
                  <span className={styles.locationShade} aria-hidden="true" />
                  <strong>0{index + 1}</strong>
                  <Image className={styles.locationMark} src="/brand/isologo.svg" alt="" width={58} height={58} />
                </div>
                <div className={styles.locationContent}>
                  <small><MapPin size={13} />{location.city}</small>
                  <h3>{location.name}</h3>
                  <p>{location.detail}</p>
                  <div className={styles.locationActions}>
                    <a href={location.maps} target="_blank" rel="noreferrer">
                      <MapPin size={16} /> Cómo llegar
                    </a>
                    <a href={whatsappLink(location.phone, `Hola TECPOINT, deseo comunicarme con ${location.name}.`)} target="_blank" rel="noreferrer">
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.opinions} aria-labelledby="opiniones-title">
          <div className={styles.opinionIntro}>
            <p className={`${styles.eyebrow} ${styles.light}`}>OPINIONES REALES</p>
            <h2 id="opiniones-title">Su experiencia también cuenta.</h2>
            <p>Consulte lo que otras personas comparten en Google o deje su opinión después de visitarnos.</p>
            <div className={styles.opinionStars} aria-label="Opiniones disponibles en Google">
              {[0, 1, 2, 3, 4].map((star) => <Star key={star} size={18} fill="currentColor" />)}
              <span>Opiniones en Google</span>
            </div>
          </div>
          <div className={styles.opinionLinks}>
            {locations.slice(0, 2).map((location) => (
              <a key={location.name} href={location.maps} target="_blank" rel="noreferrer">
                <span>{location.city}</span>
                <strong>{location.name}</strong>
                <small>Ver ubicación y opiniones <ArrowUpRight size={16} /></small>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.closing}>
          <div className={styles.closingMark} aria-hidden="true">
            <Image src="/brand/isologo.svg" alt="" width={96} height={96} />
          </div>
          <div>
            <p className={`${styles.eyebrow} ${styles.light}`}>TECNOLOGÍA QUE SE SIENTE</p>
            <h2>Encuentre la opción adecuada para usted.</h2>
          </div>
          <Link className={styles.whiteButton} href="/shop">Comprar ahora</Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
