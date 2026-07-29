import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Google Site Verification */}
        <meta
          name="google-site-verification"
          content={
            process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
            "rGu_PQAnMb87mm_8dS9oWQPpkuhg8eUwEuC8-3xKiDc"
          }
        />

        {/* Favicon */}
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />

        {/* SEO Meta Tags */}
        <meta
          name="keywords"
          content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle."
        />
        {/* Open Graph (Facebook) */}
        <meta property="og:url" content="https://tecpoint.ws" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338"
        />
        <meta
          property="og:title"
          content="Distribuidores de Accesorios Tecnológicos | Tecpoint"
        />
        <meta
          property="og:description"
          content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle."
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        {/* Twitter Meta Tags */}
        <meta
          property="twitter:title"
          content="Distribuidores de Accesorios Tecnológicos | Tecpoint"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:description"
          content="Distribuidores de Accesorios Tecnológicos | Tecpoint"
        />
        <meta
          property="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338"
        />
        <meta
          name="twitter:image:alt"
          content="Distribuidores de Accesorios Tecnológicos | Tecpoint"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
