/**
 * GET /api/products
 *
 * List products from the Shopify store.
 * Query params:
 *   - limit (number, default 20, max 100)
 *
 * Response:
 *   { products: [...], count: number }
 */
import { getProducts } from '@/lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: { message: 'Method not allowed', status: 405 } });
  }

  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const products = await getProducts(limit);
    return res.status(200).json({ products, count: products.length });
  } catch (error) {
    console.error('Products list error:', error.message);
    return res.status(500).json({
      error: { message: error.message || 'Failed to fetch products', status: 500 },
    });
  }
}
