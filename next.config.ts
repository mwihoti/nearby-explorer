import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore specific page errors
  experimental: {
    forceSwcTransforms: true,
  },
  // If you want to disable React strict mode as well
  reactStrictMode: false,
};

export default nextConfig;
