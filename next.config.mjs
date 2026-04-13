/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'community.cloudflare.steamstatic.com',
      },
    ],
  },
  // Отключаем статическую генерацию для SSR
  output: 'standalone',
};

export default nextConfig;
