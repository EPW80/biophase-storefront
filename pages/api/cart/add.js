/**
 * POST /api/cart/add
 *
 * Adds line items to an existing Shopify cart.
 *
 * Request body:
 *   {
 *     cartId: "gid://shopify/Cart/...",
 *     lines: [{ merchandiseId: "gid://shopify/ProductVariant/123", quantity: 1 }]
 *   }
 *
 * Response:
 *   { cart: { id, checkoutUrl, totalQuantity, cost, lines } }
 */
import { cartLinesAdd } from '@/lib/storefrontClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed', status: 405 } });
  }

  const { cartId, lines } = req.body || {};

  if (!cartId || !lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({
      error: {
        message: 'Request body must include "cartId" and a non-empty "lines" array',
        status: 400,
      },
    });
  }

  try {
    const cart = await cartLinesAdd(cartId, lines);
    return res.status(200).json({ cart });
  } catch (error) {
    console.error('Cart add error:', error.message);
    return res.status(500).json({
      error: { message: error.message || 'Failed to add to cart', status: 500 },
    });
  }
}
