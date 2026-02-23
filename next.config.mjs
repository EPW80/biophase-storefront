/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
    // Use Shopify's built-in image optimization instead of Next.js
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
  },
};

export default nextConfig;
