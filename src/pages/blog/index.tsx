import Footer from "@/components/Footer/page"
import NavbarMenu from "@/components/navbarmenu/page"
import Head from "next/head"

function Blog() {
  return (
    <>
      <Head>
        <title>Blog | Noticias Tech y Accesorios | Tecpoint Honduras</title>
        <meta name="description" content="Blog Tecpoint: Mantente al día con noticias, tips y trends del mundo tecnológico. Guías de accesorios y novedades." />
        <meta name="keywords" content="blog tecnología, noticias tech, guías accesorios, tips, tendencias Honduras" />
        <meta name="author" content="Tecpoint Distribucion" />
        <link rel="canonical" href="https://tecpoint.ws/blog" />

        <meta property="og:title" content="Blog | Noticias y Tips Tecnológicos | Tecpoint" />
        <meta property="og:description" content="Lee nuestro blog sobre tendencias tech, guías de accesorios y noticias del mundo tecnológico." />
        <meta property="og:url" content="https://tecpoint.ws/blog" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog Tecpoint | Noticias Tech" />
        <meta name="twitter:description" content="Mantente actualizado con noticias y tips tecnológicos en el Blog de Tecpoint" />
        <meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
      </Head>

      <NavbarMenu />

      <main className="p-2 pt-8">
        <h1 className="md:text-xl lg:text-2xl text-center">Blog Tecpoint</h1>
      </main>

      <Footer />
    </>
  )
}

export default Blog