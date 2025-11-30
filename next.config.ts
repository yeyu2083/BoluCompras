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
    return [
      {
        source: '/api/products',
        destination: 'http://backend:9002/api/products',
      },
      // Rewrite para operaciones con ID (PATCH, DELETE)
      {
        source: '/api/products/:id',
        destination: 'http://backend:9002/api/products/:id',
      },
    ];
  },
};

export default nextConfig;
