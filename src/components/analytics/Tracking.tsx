import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSiteConfig } from "@/lib/siteConfig";
import { flushMetaQueue, trackPageView } from "@/lib/tracking";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export default function Tracking() {
  const router = useRouter();
  const { gaMeasurementId: measurementId, metaPixelId } = useSiteConfig();

  useEffect(() => {
    const trackPage = (url: string) => {
      if (measurementId) window.gtag?.("config", measurementId, { page_path: url });
      trackPageView();
    };

    router.events.on("routeChangeComplete", trackPage);
    return () => router.events.off("routeChangeComplete", trackPage);
  }, [router.events, measurementId]);

  useEffect(() => {
    if (!metaPixelId) return;
    const flush = () => flushMetaQueue();
    window.addEventListener("tecpoint:meta-ready", flush);
    const retries = [250, 1000, 3000].map((delay) => window.setTimeout(flush, delay));
    return () => {
      window.removeEventListener("tecpoint:meta-ready", flush);
      retries.forEach((timer) => window.clearTimeout(timer));
    };
  }, [metaPixelId]);

  return (
    <>
      {measurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="lazyOnload"
          />
          <Script id="tecpoint-google-analytics" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${measurementId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {metaPixelId && (
        <>
          <Script id="tecpoint-meta-pixel" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <Script id="tecpoint-meta-pixel-ready" strategy="lazyOnload">
            {`window.dispatchEvent(new Event('tecpoint:meta-ready'));`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}
