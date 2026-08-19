import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "12mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-1e95a39d8c104cbf98601ac0d5db1d69.r2.dev",
      },
      {
        protocol: "https",
        hostname: "www.solgasenlima.pe",
      },
      {
        protocol: "https",
        hostname: "solgasenlima.pe",
      },
      {
        protocol: "https",
        hostname: "solgasenviogratis.com",
      },
    ],
  },
};

export default nextConfig;
