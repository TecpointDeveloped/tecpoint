import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Google Site Verification */}
        <meta
          name="google-site-verification"
          content="rGu_PQAnMb87mm_8dS9oWQPpkuhg8eUwEuC8-3xKiDc"
        />

        {/* Favicon */}
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />

        {/* SEO Meta Tags */}
        <meta
          name="keywords"
          content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle."
        />
        <meta
          name="description"
          content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle."
        />
        <meta name="robots" content="index, follow" />

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

        {/* Google Ads Tag */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-11071480891"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-11071480891');
            `,
          }}
        />

        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
              n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '516288913383243');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=516288913383243&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </Head>
      <body>
        <Main />
        <NextScript />

        {/* Evento de conversión para venta en el sitio web */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('event', 'conversion', {
                  'send_to': 'AW-11071480891/aFf1CKL36ogYELvIpZ8p',
                  'transaction_id': ''
              });
            `,
          }}
        />
      </body>
    </Html>
  );
}