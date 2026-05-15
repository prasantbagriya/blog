import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: false,
  productionBrowserSourceMaps: false,
  
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
    ],
  },
  
  reactCompiler: false,
  experimental: {
    cpus: 1,
    workerThreads: false,
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns'],
  },

  async redirects() {
    return [
      {
        source: '/admin/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.chatwizs.com' }],
        destination: 'https://chatwizs.com/:path*',
        permanent: true,
      },
    ];
  },
  
  // ✅ Removed custom headers block to prevent MIME type conflicts on Hostinger
};

export default nextConfig;
