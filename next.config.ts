import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:9003';
    return [
      {
        source: '/api/products',
        destination: `${backendUrl}/api/products`,
      },
      // Rewrite para operaciones con ID (PATCH, DELETE)
      {
        source: '/api/products/:id',
        destination: `${backendUrl}/api/products/:id`,
      },
    ];
  },
};

export default nextConfig;
