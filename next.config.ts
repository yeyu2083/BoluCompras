import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
        destination: 'http://localhost:5000/api/products',
      },
      // Rewrite para operaciones con ID (PATCH, DELETE)
      {
        source: '/api/products/:id',
        destination: 'http://localhost:5000/api/products/:id',
      },
    ];
  },
};

export default nextConfig;
