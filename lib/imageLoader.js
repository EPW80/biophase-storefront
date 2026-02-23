/**
 * Custom image loader for Shopify CDN images.
 * Shopify CDN already serves optimized images, so we pass through the URL.
 * The width parameter is available for future Shopify CDN transforms.
 */
export default function shopifyImageLoader({ src }) {
  return src;
}
