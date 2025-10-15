import { readFileSync } from "fs";
import { join } from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
