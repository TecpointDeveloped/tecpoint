import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* <meta name="google-site-verification" content="0N-x9qwwAQ5jAjiyDKeG7YY08OW2m_FfKJXmqvOC33w" /> */}

        <meta name="google-site-verification" content="0N-x9qwwAQ5jAjiyDKeG7YY08OW2m_FfKJXmqvOC33w" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        {/* Fallback metadata */}
        <meta property="og:image" content="/favicon.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
