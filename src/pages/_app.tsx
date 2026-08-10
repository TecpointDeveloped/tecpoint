import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { SiteConfigProvider, useSiteConfig } from "@/lib/siteConfig";
import Head from "next/head";

const Tracking = dynamic(() => import("@/components/analytics/Tracking"), {
  ssr: false,
});
const AppIntro = dynamic(() => import("@/components/AppIntro/page"), {
  ssr: false,
});

function DynamicSiteMeta() {
  const { googleSiteVerification } = useSiteConfig();
  return <Head><meta name="google-site-verification" content={googleSiteVerification} /></Head>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SiteConfigProvider>
        <DynamicSiteMeta />
        <AppIntro />
        <Tracking />
        <Component {...pageProps} />
      </SiteConfigProvider>
    </AuthProvider>
  );
}
