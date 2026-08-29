import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import Footer from "@/components/Footer/page";
import NavbarMenu from "@/components/navbarmenu/page";
import { db } from "@/database/Config";
import {
  enrichProduct,
  approvedCatalogProducts,
  getCurrentInventory,
  OFFICIAL_CATEGORIES,
  officialCategory,
  preferredProductSlug,
  isNewProduct,
  productAddedTime,
  publicCatalog,
} from "@/lib/catalog";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";
import styles from "@/styles/categoryLanding.module.css";
import type { Product } from "@/types/ProductTypes";
import { productImageFallback } from "@/lib/imageFallback";

type CategoryCopy = {
  title: string;
  summary: string;
  guide: string[];
  questions: Array<{ question: string; answer: string }>;
};

const CATEGORY_COPY: Record<string, CategoryCopy> = {
  "power-and-charge": {
    title: "Cargadores, cables y energía portátil en Honduras",
    summary: "Encuentre cargadores de pared, cubos de carga, cables, adaptadores y power banks. Compare potencia, conector y compatibilidad antes de elegir.",
    guide: ["Confirme si su dispositivo utiliza USB-C, Lightning u otro conector.", "Compare la potencia admitida por el equipo y el cargador.", "Use cables y adaptadores adecuados para evitar una carga lenta o inestable."],
    questions: [
      { question: "¿Cómo sé qué cargador necesita mi teléfono?", answer: "Revise el modelo exacto, el tipo de conector y la potencia máxima admitida. Un asesor TECPOINT puede ayudarle a confirmarlo." },
      { question: "¿Un cargador de mayor potencia daña el dispositivo?", answer: "Los equipos compatibles regulan la energía que reciben, pero el cargador, cable y protocolo deben ser adecuados y de buena calidad." },
    ],
  },
  "screen-protection": {
    title: "Protectores de pantalla y privacidad",
    summary: "Proteja la pantalla con vidrio, lámina o filtro de privacidad diseñado para el modelo y tamaño correctos de su dispositivo.",
    guide: ["Confirme modelo, generación y tamaño de pantalla.", "Elija entre protección transparente, privacidad o control de reflejos.", "Verifique recortes, sensores y compatibilidad con el case."],
    questions: [
      { question: "¿Todos los protectores sirven para modelos parecidos?", answer: "No. Cambios pequeños en tamaño, cámara o sensores pueden impedir un ajuste correcto." },
      { question: "¿Qué hace un protector de privacidad?", answer: "Reduce la visibilidad lateral de la pantalla; su efecto y nivel de brillo pueden variar según el producto." },
    ],
  },
  "sound-essentials": {
    title: "Audífonos, auriculares y audio para su día",
    summary: "Compare audífonos Bluetooth, earbuds, headsets, parlantes y accesorios de audio según conexión, autonomía y forma de uso.",
    guide: ["Defina si necesita llamadas, música, trabajo o actividad física.", "Revise conexión, autonomía y controles disponibles.", "Confirme compatibilidad con su teléfono, computadora o consola."],
    questions: [
      { question: "¿Bluetooth funciona con cualquier teléfono?", answer: "La mayoría de accesorios modernos son compatibles, pero algunas funciones dependen de la versión Bluetooth, el sistema y la aplicación." },
      { question: "¿Qué autonomía necesito?", answer: "Depende de sus horas de uso y acceso a carga. Compare la duración de los audífonos y la capacidad adicional del estuche." },
    ],
  },
  "smart-tech": {
    title: "Accesorios inteligentes para cada dispositivo",
    summary: "Cases, soportes, relojes y accesorios tecnológicos seleccionados para resolver necesidades reales sin complicar su rutina.",
    guide: ["Empiece por la necesidad que desea resolver.", "Confirme modelo, dimensiones y requisitos de conexión.", "Compare funciones útiles, no solamente apariencia."],
    questions: [
      { question: "¿Cómo confirmo compatibilidad?", answer: "Comparta con un asesor el modelo exacto, generación, año y sistema operativo de su dispositivo." },
      { question: "¿TECPOINT vende accesorios para Apple y Samsung?", answer: "Sí, además de alternativas para otras marcas. La disponibilidad depende del inventario actual." },
    ],
  },
  "travel-and-carry": {
    title: "Bolsos, estuches y organización tecnológica",
    summary: "Lleve cables, cargadores, audífonos y dispositivos de forma más ordenada con soluciones para trabajo, estudio y viaje.",
    guide: ["Compare dimensiones con los dispositivos que transporta.", "Revise compartimentos, cierres y materiales.", "Elija capacidad suficiente sin sumar volumen innecesario."],
    questions: [
      { question: "¿Cómo elijo el tamaño correcto?", answer: "Mida su dispositivo y considere cargadores, cables y accesorios adicionales que llevará habitualmente." },
      { question: "¿Los estuches son resistentes al agua?", answer: "Solamente cuando la ficha lo indica expresamente. Resistencia a salpicaduras no significa impermeabilidad total." },
    ],
  },
  "smart-drive": {
    title: "Accesorios tecnológicos para su vehículo",
    summary: "Encuentre cargadores, soportes, audio y soluciones para usar sus dispositivos con mayor orden y seguridad dentro del vehículo.",
    guide: ["Confirme el tipo de puerto o instalación disponible.", "Priorice acceso seguro sin bloquear su visibilidad.", "Revise potencia, sujeción y compatibilidad con el dispositivo."],
    questions: [
      { question: "¿Qué soporte funciona con mi teléfono?", answer: "Depende del tamaño, peso, case y zona de instalación. Los sistemas magnéticos pueden requerir una placa o compatibilidad específica." },
      { question: "¿Puedo cargar varios dispositivos en el carro?", answer: "Sí, si el adaptador ofrece los puertos y la potencia necesarios para distribuir la carga correctamente." },
    ],
  },
  "outdoor-pro": {
    title: "Tecnología para exteriores y actividades exigentes",
    summary: "Explore accesorios prácticos para actividades fuera de casa, transporte frecuente y situaciones que requieren materiales más resistentes.",
    guide: ["Revise certificaciones y límites de resistencia indicados.", "Compare autonomía, peso y facilidad de transporte.", "No asuma protección contra agua o golpes si la ficha no lo confirma."],
    questions: [
      { question: "¿Resistente al agua significa sumergible?", answer: "No necesariamente. Revise la certificación IP y las condiciones específicas del fabricante." },
      { question: "¿Qué debo priorizar para uso exterior?", answer: "Autonomía, resistencia documentada, facilidad de transporte y compatibilidad con sus otros equipos." },
    ],
  },
};

type Props = { category: (typeof OFFICIAL_CATEGORIES)[number]; products: Product[]; copy: CategoryCopy };

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: OFFICIAL_CATEGORIES.map((category) => ({ params: { slug: category.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.slug || "");
  const category = OFFICIAL_CATEGORIES.find((item) => item.slug === slug);
  if (!category) return { notFound: true };

  try {
    const databaseName = process.env.NEXT_PUBLIC_DATABASE_NAME;
    const snapshot = databaseName ? await getDocs(collection(db, databaseName)) : null;
    const products = snapshot
      ? publicCatalog([...snapshot.docs.map((item) => {
          const data = item.data();
          return enrichProduct({
            id: item.id,
            ...data,
            fecha_agregado: data.fecha_agregado?.toDate?.().toISOString() || null,
          } as Product);
        }), ...approvedCatalogProducts()])
          .filter((product) => Boolean(getCurrentInventory(product.sku)))
          .filter((product) => officialCategory(product) === category.name)
          .filter((product) => product.extradata?.stock === true)
          .sort((left, right) => productAddedTime(right) - productAddedTime(left))
          .slice(0, 6)
      : [];
    return { props: { category, products, copy: CATEGORY_COPY[slug] }, revalidate: 300 };
  } catch (error) {
    console.error(`No se pudo generar la categoría ${slug}:`, error);
    return { props: { category, products: [], copy: CATEGORY_COPY[slug] }, revalidate: 60 };
  }
};

function productImage(product: Product) {
  return product.imagenes?.imagen_01?.img || Object.values(product.imagenes || {})[0]?.img || "/default-product.png";
}

function productPrice(product: Product) {
  return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL", maximumFractionDigits: 0 }).format(Number(product.precio?.detalle || 0));
}

export default function CategoryLanding({ category, products, copy }: Props) {
  const { onlineWhatsApp } = useSiteConfig();
  const canonical = `https://tecpoint.ws/categories/${category.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "TECPOINT", item: "https://tecpoint.ws/" },
        { "@type": "ListItem", position: 2, name: "Categorías", item: "https://tecpoint.ws/categories" },
        { "@type": "ListItem", position: 3, name: category.name, item: canonical },
      ] },
      { "@type": "ItemList", name: copy.title, itemListElement: products.map((product, index) => ({
        "@type": "ListItem", position: index + 1, url: `https://tecpoint.ws/shop/${preferredProductSlug(product)}`, name: product.producto,
      })) },
      { "@type": "FAQPage", mainEntity: copy.questions.map((item) => ({
        "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer },
      })) },
    ],
  };

  return <>
    <Head>
      <title>{`${copy.title} | TECPOINT`}</title>
      <meta name="description" content={copy.summary.slice(0, 158)} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="es-HN" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
      <meta property="og:title" content={`${copy.title} | TECPOINT`} />
      <meta property="og:description" content={copy.summary} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content="https://tecpoint.ws/images/og_image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>
    <NavbarMenu />
    <main className={styles.page}>
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}>{category.name}</p><h1>{copy.title}</h1><p className={styles.summary}>{copy.summary}</p>
          <div className={styles.actions}><a href="#productos">Ver productos</a><a href={whatsappLink(onlineWhatsApp, `Hola TECPOINT, necesito ayuda con productos de ${category.name}.`)} target="_blank" rel="noreferrer">Consultar compatibilidad</a></div>
        </div>
        <Image src="/brand/isologo.svg" alt="" width={220} height={220} priority />
      </section>

      <section className={styles.guide}><p>ANTES DE ELEGIR</p><h2>Tres comprobaciones que evitan una compra equivocada.</h2><ol>{copy.guide.map((item) => <li key={item}>{item}</li>)}</ol></section>

      <section id="productos" className={styles.products}><div className={styles.sectionHeading}><div><p>SELECCIÓN ACTUAL</p><h2>Opciones disponibles.</h2></div><Link href={`/shop?category=${category.slug}`}>Ver catálogo completo →</Link></div>
        {products.length ? <div className={styles.productGrid}>{products.map((product) => <Link href={`/shop/${preferredProductSlug(product)}`} key={product.id} className={styles.productCard}>
          <div className={styles.imageWrap}>{isNewProduct(product) && <b>Nuevo</b>}<Image src={productImage(product)} alt={product.producto} width={520} height={520} sizes="(max-width: 760px) 90vw, 30vw" onError={productImageFallback} /></div>
          <small>{product.marca_producto?.marca}</small><h3>{product.producto}</h3><strong>{productPrice(product)}</strong><span>Conocer producto →</span>
        </Link>)}</div> : <div className={styles.empty}>El inventario cambia constantemente. Consulte con un asesor para conocer las opciones disponibles.</div>}
      </section>

      <section className={styles.faq}><div><p>PREGUNTAS FRECUENTES</p><h2>Elija con información clara.</h2></div><div>{copy.questions.map((item) => <article key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div></section>
    </main>
    <Footer />
  </>;
}
