import { AuthProvider } from "@/context/AuthContext";
// import Head from "next/head";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      {/* <Head>
        <title>Distribuidores de Accesorios Tecnológicos | Tecpoint</title>
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <meta name="keywords" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta name="description" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta property="og:url" content="https://tecpoint.ws" />
        <meta property="og:image" content="/favicon.png" />
        <meta property="og:title" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
        <meta property="og:description" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
        <meta name="twitter:description" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
        <meta name="twitter:image" content="favicon.png" />
        <meta name="twitter:image:alt" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
      </Head> */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}
