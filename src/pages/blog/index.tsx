import NavbarMenu from "@/components/navbarmenu/page"
import Head from "next/head"

function Blog() {
  return (
    <>
      <Head>
        <title>Blog | Tecpoint Distribucion</title>
        <meta name="description" content="blog tecpoint distribucion, mantente al dia con noticias en el mundo tecnologico" />
        <meta property="og:url" content="https://tecpoint.ws/blog" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <meta property="og:title" content="Blog | Tecpoint Distribucion" />
        <meta property="og:description" content="blog tecpoint distribucion, mantente al dia con noticias en el mundo tecnologico" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />
        <meta property="twitter:title" content="Blog | Tecpoint Distribucion" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:description" content="blog tecpoint distribucion, mantente al dia con noticias en el mundo tecnologico" />
        <meta property="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <meta name="twitter:image:alt" content="Blog | Tecpoint Distribucion" />
      </Head>

      <NavbarMenu />

      <main className="p-2 pt-8">
        <h1 className="md:text-xl lg:text-2xl text-center">Blog Tecpoint</h1>
      </main>
    </>
  )
}

export default Blog