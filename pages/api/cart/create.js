/**
 * POST /api/cart/create
 *
 * Creates a new Shopify cart, optionally with initial line items.
 *
 * Request body (optional):
 *   { lines: [{ merchandiseId: "gid://shopify/ProductVariant/123", quantity: 1 }] }
 *
 * Response:
 *   { cart: { id, checkoutUrl, totalQuantity, cost, lines } }
 */
import { cartCreate } from '@/lib/storefrontClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed', status: 405 } });
  }

  try {
    const { lines = [] } = req.body || {};
    const cart = await cartCreate(lines);
    return res.status(201).json({ cart });
  } catch (error) {
    console.error('Cart create error:', error.message);
    return res.status(500).json({
      error: { message: error.message || 'Failed to create cart', status: 500 },
    });
  }
}
