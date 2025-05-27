/** @type {import('next').NextConfig} */

// Log environment variables at the start of config loading
console.log("Loading next.config.js...");
console.log("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (in next.config.js):", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
console.log("NEXT_PUBLIC_API_URL (in next.config.js):", process.env.NEXT_PUBLIC_API_URL);
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['images.unsplash.com'],
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