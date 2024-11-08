import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['www.vdocipher.com'], // Add this to allow the external image domain
  },
  webpack: (config) => {
    // Required for WebSocket support
    config.externals = [...(config.externals || []), { 'utf-8-validate': 'commonjs utf-8-validate', 'bufferutil': 'commonjs bufferutil' }];
    return config;
  }
};

export default nextConfig;