import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      {/* <Head /> */}
      <Head>
        <meta name="google-site-verification" content="0N-x9qwwAQ5jAjiyDKeG7YY08OW2m_FfKJXmqvOC33w" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="robots" content="index, follow"/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
