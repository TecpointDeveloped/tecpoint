import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../database/Config";
import { Product } from "@/types/ProductTypes";
import NavbarMenu from "@/components/navbarmenu/page";
import Footer from "@/components/Footer/page";
import styles from "@/styles/home2026.module.css";
import currentCatalog from "@/data/current-catalog-w31.json";

export async function getServerSideProps() {
  const productDocs = await getDocs(
    collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string),
  );

  const inventoryBySku = new Map(
    currentCatalog.records.map((item) => [item.sku, item]),
  );

  const products = productDocs.docs.map<Product>((doc) => {
    const data = doc.data();
    const inventory = inventoryBySku.get(String(data.sku || "").trim());
    return {
      id: doc.id,
      ...data,
      precio: {
        ...data.precio,
        detalle: inventory?.detailPrice || data.precio?.detalle || 0,
      },
      extradata: {
        ...data.extradata,
        stock: Boolean(inventory && inventory.stock > 0),
      },
      fecha_agregado: data.fecha_agregado?.toDate
        ? data.fecha_agregado.toDate().toISOString()
        : null,
    } as Product;
  })
    .filter((product) => inventoryBySku.has(String(product.sku || "").trim()))
    .sort((a, b) => {
      const dateA = a.fecha_agregado
        ? new Date(a.fecha_agregado).getTime()
        : 0;
      const dateB = b.fecha_agregado
        ? new Date(b.fecha_agregado).getTime()
        : 0;
      return dateB - dateA;
    });

  return { props: { products } };
}

const categories = [
  {
    number: "01",
    title: "Power & Charge",
    copy: "Carga, energía y adaptadores para mantener todo en movimiento.",
    href: "/shop?page=1&brand=&category=cargadores&search=",
  },
  {
    number: "02",
    title: "Sound Essentials",
    copy: "Audio seleccionado para trabajo, llamadas y entretenimiento.",
    href: "/shop?page=1&brand=&category=sonido&search=",
  },
  {
    number: "03",
    title: "Screen Protection",
    copy: "Protección compatible para los dispositivos que más utiliza.",
    href: "/shop?page=1&brand=&category=protector&search=",
  },
  {
    number: "04",
    title: "Smart Tech",
    copy: "Tecnología inteligente que se integra naturalmente a su rutina.",
    href: "/shop?page=1&brand=&category=reloj&search=",
  },
];

const locations = [
  {
    city: "San Pedro Sula",
    name: "Plaza Carolina",
    detail: "Segundo nivel, bulevar Mackay",
    phone: "50493385732",
  },
  {
    city: "Tegucigalpa",
    name: "Portal de Viera",
    detail: "Tercer nivel, km 3 carretera a El Hatillo",
    phone: "50495200523",
  },
  {
    city: "San Pedro Sula",
    name: "Mayoreo & Pick Up",
    detail: "Barrio Los Andes, 7 calle, 14 avenida",
    phone: "50498191003",
  },
];

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

export default function Home({ products }: { products: Product[] }) {
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
      <Head>
        <title>TECPOINT | Tecnología bien elegida</title>
        <meta
          name="description"
          content="Accesorios tecnológicos seleccionados, compatibilidad clara y atención cercana. Compra al detalle y al mayoreo en Honduras."
        />
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
        <link rel="icon" href="/brand/isologo.svg" />
      </Head>

      <div className={styles.announcement}>
        <span>ENVÍO GRATIS EN COMPRAS MAYORES A L 1,500</span>
        <span>ENVÍOS NACIONALES · PICK UP DISPONIBLE</span>
      </div>

      <NavbarMenu />

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
              <div><strong>+680</strong><span>productos registrados</span></div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <Image
              src="/images/producto-editorial-2026.png"
              alt="Accesorios tecnológicos seleccionados por TECPOINT"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className={styles.heroSeal}>
              <Image src="/brand/isologo.svg" alt="" width={62} height={62} />
              <span>SELECCIÓN TECPOINT</span>
            </div>
            <span className={styles.heroNote}>PRECISIÓN · UTILIDAD · DISEÑO</span>
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
            {categories.map((category) => (
              <Link
                className={styles.categoryCard}
                href={category.href}
                key={category.number}
              >
                <span>{category.number}</span>
                <b>↘</b>
                <h3>{category.title}</h3>
                <p>{category.copy}</p>
                <strong>Explorar →</strong>
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
                <Link className={styles.productImage} href={`/shop/${product.slug}`}>
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
                    <Link href={`/shop/${product.slug}`}>Ver producto +</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.experience} id="experiencia">
          <div className={styles.experienceImage}>
            <Image
              src="/images/experiencia-tecpoint-2026.png"
              alt="Experiencia TECPOINT"
              fill
              sizes="(max-width: 900px) 100vw, 54vw"
            />
          </div>
          <div className={styles.experienceCopy}>
            <p className={`${styles.eyebrow} ${styles.light}`}>EXPERIENCIA TECPOINT</p>
            <h2>Tecnología que se siente.</h2>
            <p>
              Comprar tecnología debería sentirse claro desde el primer
              vistazo: entender la compatibilidad, reconocer el beneficio y
              recibir orientación sin presión.
            </p>
            <ol>
              <li><span>01</span><div><strong>Selección con criterio</strong><p>Productos elegidos por utilidad, calidad y diseño.</p></div></li>
              <li><span>02</span><div><strong>Confianza al elegir</strong><p>Información y compatibilidad presentadas con claridad.</p></div></li>
              <li><span>03</span><div><strong>Experiencia cuidada</strong><p>Atención cercana antes, durante y después de la compra.</p></div></li>
            </ol>
          </div>
        </section>

        <section className={styles.advisor}>
          <div>
            <p className={`${styles.eyebrow} ${styles.light}`}>COMPATIBILIDAD PRIMERO</p>
            <h2>¿No sabe cuál elegir?</h2>
            <p>
              Envíenos el modelo exacto de su dispositivo. Un asesor le ayudará
              a identificar la opción adecuada.
            </p>
          </div>
          <a
            className={styles.whiteButton}
            href="https://wa.me/50494659287?text=Hola%2C%20necesito%20ayuda%20para%20elegir%20un%20accesorio%20compatible."
            target="_blank"
            rel="noreferrer"
          >
            Consultar compatibilidad
          </a>
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
            <a
              className={styles.darkButton}
              href="https://wa.me/50498191003?text=Hola%2C%20deseo%20información%20sobre%20ventas%20al%20mayoreo."
              target="_blank"
              rel="noreferrer"
            >
              Hablar con mayoreo
            </a>
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

        <section className={styles.locations}>
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
                <span>0{index + 1}</span>
                <small>{location.city}</small>
                <h3>{location.name}</h3>
                <p>{location.detail}</p>
                <a
                  href={`https://wa.me/${location.phone}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contactar por WhatsApp →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.closing}>
          <Image src="/brand/isologo.svg" alt="" width={96} height={96} />
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
