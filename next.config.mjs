/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Ensure Anthropic SDK only runs server-side
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
