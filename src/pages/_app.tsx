import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { SiteConfigProvider, useSiteConfig } from "@/lib/siteConfig";
import Head from "next/head";
import { useRouter } from "next/router";

const Tracking = dynamic(() => import("@/components/analytics/Tracking"), {
  ssr: false,
});
const MotionSystem = dynamic(() => import("@/components/MotionSystem/page"), {
  ssr: false,
});
const HalloweenDecor = dynamic(() => import("@/components/HalloweenDecor/page"), {
  ssr: false,
});
const SeasonalPromo = dynamic(() => import("@/components/SeasonalPromo/page"), {
  ssr: false,
});

function DynamicSiteMeta() {
  const { googleSiteVerification } = useSiteConfig();
  return <Head><meta name="google-site-verification" content={googleSiteVerification} /></Head>;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const showStorefrontDecor = !router.pathname.startsWith("/admin");

  return (
    <AuthProvider>
      <SiteConfigProvider>
        <DynamicSiteMeta />
        <Tracking />
        <MotionSystem />
        {showStorefrontDecor && <HalloweenDecor />}
        {showStorefrontDecor && <SeasonalPromo />}
        <Component {...pageProps} />
      </SiteConfigProvider>
    </AuthProvider>
  );
}
