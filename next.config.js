/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['node:sqlite'],
  },
  env: {
    DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD || 'utmbalas123',
  },
};

module.exports = nextConfig;
