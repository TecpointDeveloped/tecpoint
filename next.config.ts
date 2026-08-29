import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: process.cwd(),
  images: {
    // Vercel's image optimizer quota can return 402 and leave the catalog
    // without product artwork. Firebase already serves optimized originals,
    // so bypass the paid optimizer and keep images available on every device.
    unoptimized: true,
    minimumCacheTTL: 2678400,
    contentDispositionType: 'inline',
    formats: ['image/webp'],
    qualities: [65, 70, 75, 80, 82, 85, 95, 96, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/tecpoint-2024.appspot.com/o/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.macstation.com.ar",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.tecpoint.ws",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tecpoint.ws",
        pathname: "/**",
      }
    ],
  },
  async redirects() {
    return [
      {
        source: "/scan",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en/blog",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/shop/shop/naztech-pd68w-gan-dual-wall-charger-white",
        destination: "/shop?search=Naztech%20PD68W%20GaN%20cargador",
        permanent: true,
      },
      {
        source: "/shop/shop/:slug*",
        destination: "/shop/:slug*",
        permanent: true,
      },
      {
        source: "/product-tag/:path*",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/marcas/:path*",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/product/z4-display-promotional-desktop-carton-shelf",
        destination: "/shop?search=Z4%20display%20promocional",
        permanent: true,
      },
      {
        source: "/shop/forro-xbase-sparkleline-samsung-galaxy-ultra-dorado",
        destination: "/shop?search=XBASE%20Sparkleline%20Samsung%20Galaxy%20Ultra",
        permanent: true,
      },
      {
        source: "/shop/naztech-xpods-pro-tws-with-wireless-charging-black-case",
        destination: "/shop?search=Naztech%20Xpods%20Pro",
        permanent: true,
      },
      {
        source: "/shop/funda-ghostek-atomic-slim-5-iphone-13-pro-black",
        destination: "/shop?search=Ghostek%20Atomic%20Slim%20iPhone%2013%20Pro",
        permanent: true,
      },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
      {
        key: "Content-Security-Policy",
        value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com; object-src 'none'; upgrade-insecure-requests",
      },
    ];

    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/api/(.*)", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/logos/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
