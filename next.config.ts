import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Ensure Anthropic SDK only runs server-side
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
