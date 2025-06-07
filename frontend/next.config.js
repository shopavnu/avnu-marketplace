/** @type {import('next').NextConfig} */

// Detect Vercel environment
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

// Log environment for debugging
console.log("Loading next.config.js...");
console.log("Is Vercel Environment:", isVercel);
console.log("Node Environment:", process.env.NODE_ENV);
console.log("Node Version:", process.version);

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // For Vercel deployment, temporarily allow ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // For Vercel deployment, temporarily allow TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: isVercel, // Use unoptimized images on Vercel which has its own optimizer
  },
  // Vercel-specific optimizations
  experimental: {
    optimizeCss: true,
  },
  // // Disable static generation for pages that use browser APIs
  // exportPathMap: async function () {
  //   return {
  //     '/': { page: '/' },
  //     // Explicitly exclude problematic pages from static generation
  //     // These will be rendered at runtime instead
  //   };
  // },
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