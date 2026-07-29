import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import NavbarMenu from "@/components/navbarmenu/page";
import Footer from "@/components/Footer/page";
import { OFFICIAL_CATEGORIES } from "@/lib/catalog";
import styles from "@/styles/categories2026.module.css";

export default function Categories() {
  return (
    <>
      <Head>
        <title>Categorías | TECPOINT</title>
        <meta
          name="description"
          content="Explore las siete categorías oficiales de TECPOINT y encuentre tecnología según su necesidad."
        />
        <link rel="canonical" href="https://tecpoint.ws/categories" />
      </Head>
      <NavbarMenu />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div>
            <p>SIETE FORMAS DE ENCONTRAR SU PUNTO</p>
            <h1>Tecnología organizada para elegir mejor.</h1>
          </div>
          <Image src="/brand/isologo.svg" alt="" width={170} height={170} />
        </section>

        <section className={styles.grid}>
          {OFFICIAL_CATEGORIES.map((category, index) => (
            <Link
              href={`/shop?page=1&category=${category.slug}`}
              key={category.slug}
              className={styles.card}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{category.name}</h2>
                <p>{category.description}</p>
              </div>
              <strong>Explorar categoría →</strong>
            </Link>
          ))}
        </section>

        <section className={styles.help}>
          <div>
            <p>¿No sabe cuál elegir?</p>
            <h2>Un asesor puede confirmar compatibilidad por usted.</h2>
          </div>
          <a
            href="https://wa.me/50497157784?text=Hola%20TECPOINT%2C%20necesito%20ayuda%20para%20encontrar%20un%20producto%20compatible."
            target="_blank"
            rel="noreferrer"
          >
            Consultar por WhatsApp
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
