/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  // Disable static generation for pages that use browser APIs
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      // Explicitly exclude problematic pages from static generation
      // These will be rendered at runtime instead
    };
  },
  // Ensure admin routes are properly handled
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin',
      },
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
}

module.exports = nextConfig