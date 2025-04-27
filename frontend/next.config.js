/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
}

module.exports = nextConfig
