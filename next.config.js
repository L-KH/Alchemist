/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['raw.githubusercontent.com', 'replicate.delivery','ipfs.io', 'oaidalleapiprodscus.blob.core.windows.net'],

  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  eslint: {
    // Ignore during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
