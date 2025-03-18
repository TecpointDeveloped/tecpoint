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
    ],
  },
};

export default nextConfig;