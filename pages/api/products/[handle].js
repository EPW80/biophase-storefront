/**
 * GET /api/products/[handle]
 *
 * Fetch a single product by its URL handle.
 *
 * Response:
 *   { product: { id, title, handle, ... } }
 */
import { getProductByHandle } from '@/lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: { message: 'Method not allowed', status: 405 } });
  }

  const { handle } = req.query;

  if (!handle || typeof handle !== 'string') {
    return res.status(400).json({
      error: { message: 'Product handle is required', status: 400 },
    });
  }

  try {
    const product = await getProductByHandle(handle);

    if (!product) {
      return res.status(404).json({
        error: { message: 'Product not found', status: 404 },
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('Product fetch error:', error.message);
    return res.status(500).json({
      error: { message: error.message || 'Failed to fetch product', status: 500 },
    });
  }
}
