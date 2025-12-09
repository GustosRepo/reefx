import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to complete with warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete with type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
