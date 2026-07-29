import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  images: {
    minimumCacheTTL: 2678400,
    contentDispositionType: 'inline',
    formats: ['image/webp'],
    // unoptimized: true,

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
    ];
  },
};

export default nextConfig;
