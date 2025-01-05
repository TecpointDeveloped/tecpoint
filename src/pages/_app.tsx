import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  const title = pageProps.title ? pageProps.title : "Pagina de Producto";
  const description = pageProps.description ? pageProps.description : "Default description";
  const slug = pageProps.slug ? pageProps.slug : "default-slug";

  return (
    <AuthProvider>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={title} />
        <meta property="og:url" content={`https://tecpoint.vercel.app/shop/${slug}`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}