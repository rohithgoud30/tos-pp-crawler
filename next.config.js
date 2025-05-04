/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Fix favicon conflict
  webpack: (config) => {
    config.resolve.fallback = { fs: false }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/s2/favicons/**', // Allow images from the favicons path
      },
      // Add other patterns here if needed for other logo sources
    ],
  },
}

module.exports = nextConfig
