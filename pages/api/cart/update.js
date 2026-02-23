/**
 * POST /api/cart/update
 *
 * Updates line item quantities in a Shopify cart.
 *
 * Request body:
 *   {
 *     cartId: "gid://shopify/Cart/...",
 *     lines: [{ id: "gid://shopify/CartLine/...", quantity: 2 }]
 *   }
 *
 * Response:
 *   { cart: { id, checkoutUrl, totalQuantity, cost, lines } }
 */
import { cartLinesUpdate } from '@/lib/storefrontClient';

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
    const cart = await cartLinesUpdate(cartId, lines);
    return res.status(200).json({ cart });
  } catch (error) {
    console.error('Cart update error:', error.message);
    return res.status(500).json({
      error: { message: error.message || 'Failed to update cart', status: 500 },
    });
  }
}
