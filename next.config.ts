import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/pricing-students", destination: "/pricing", permanent: true },
      { source: "/pricing-schools", destination: "/schools/pricing", permanent: true },
    ];
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    ppr: true,
    clientSegmentCache: true,
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
};

export default nextConfig;
