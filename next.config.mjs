import { readFileSync } from "fs";
import { join } from "path";

/** @type {import('next').NextConfig} */
// Allow next/image to load from API origin (e.g. uploads at localhost:5000 or production API)
function getImageRemotePatterns() {
  const patterns = [
    { protocol: "http", hostname: "localhost", port: "5000", pathname: "/uploads/**" },
    { protocol: "http", hostname: "127.0.0.1", port: "5000", pathname: "/uploads/**" },
  ];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const u = new URL(apiUrl);
      const entry = {
        protocol: u.protocol.replace(":", ""),
        hostname: u.hostname,
        pathname: "/uploads/**",
      };
      if (u.port) entry.port = u.port;
      patterns.push(entry);
    } catch (_) {}
  }
  return patterns;
}

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: getImageRemotePatterns(),
  },
  // HTTPS configuration for development
  ...(process.env.NODE_ENV === "development" &&
    process.env.HTTPS === "true" && {
      experimental: {
        serverComponentsExternalPackages: [],
      },
      webpack: (config) => {
        return config;
      },
      // Custom server configuration for HTTPS
      serverRuntimeConfig: {
        https: {
          key: process.env.SSL_KEY_FILE
            ? readFileSync(join(process.cwd(), process.env.SSL_KEY_FILE))
            : undefined,
          cert: process.env.SSL_CRT_FILE
            ? readFileSync(join(process.cwd(), process.env.SSL_CRT_FILE))
            : undefined,
        },
      },
    }),
};

export default nextConfig;
