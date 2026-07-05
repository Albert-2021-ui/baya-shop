/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration des images pour autoriser les domaines externes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Ne pas bloquer le build si TypeScript a des erreurs (projet JS)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

