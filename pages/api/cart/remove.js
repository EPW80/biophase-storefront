/**
 * POST /api/cart/remove
 *
 * Removes line items from a Shopify cart.
 *
 * Request body:
 *   {
 *     cartId: "gid://shopify/Cart/...",
 *     lineIds: ["gid://shopify/CartLine/..."]
 *   }
 *
 * Response:
 *   { cart: { id, checkoutUrl, totalQuantity, cost, lines } }
 */
import { cartLinesRemove } from '@/lib/storefrontClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed', status: 405 } });
  }

  const { cartId, lineIds } = req.body || {};

  if (!cartId || !lineIds || !Array.isArray(lineIds) || lineIds.length === 0) {
    return res.status(400).json({
      error: {
        message: 'Request body must include "cartId" and a non-empty "lineIds" array',
        status: 400,
      },
    });
  }

  try {
    const cart = await cartLinesRemove(cartId, lineIds);
    return res.status(200).json({ cart });
  } catch (error) {
    console.error('Cart remove error:', error.message);
    return res.status(500).json({
      error: { message: error.message || 'Failed to remove from cart', status: 500 },
    });
  }
}
