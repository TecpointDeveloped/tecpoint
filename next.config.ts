import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  images: {
    minimumCacheTTL: 2678400,
    contentDispositionType: 'inline',
    formats: ['image/webp'],
    qualities: [65, 70, 75, 80, 82, 85, 95, 96, 100],
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
