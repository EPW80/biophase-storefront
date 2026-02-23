const express = require('express');
const router = express.Router();
const { client, gql } = require('../lib/shopifyClient');

/**
 * @swagger
 * components:
 *   schemas:
 *     CartLine:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         quantity:
 *           type: integer
 *         variant:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             title:
 *               type: string
 *             price:
 *               type: object
 *             productTitle:
 *               type: string
 *             productHandle:
 *               type: string
 *             image:
 *               type: object
 *               nullable: true
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         checkoutUrl:
 *           type: string
 *         lines:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartLine'
 *         subtotal:
 *           type: object
 *         total:
 *           type: object
 */

const CART_FRAGMENT = `
  id
  checkoutUrl
  lines(first: 25) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            priceV2 {
              amount
              currencyCode
            }
            product {
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  estimatedCost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
`;

/**
 * Transform raw Shopify cart data into a clean API response
 */
function transformCart(cart) {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines:
      cart.lines?.edges?.map((edge) => {
        const node = edge.node;
        const variant = node.merchandise;
        return {
          id: node.id,
          quantity: node.quantity,
          variant: {
            id: variant.id,
            title: variant.title,
            price: variant.priceV2,
            productTitle: variant.product?.title,
            productHandle: variant.product?.handle,
            image: variant.product?.images?.edges?.[0]?.node || null,
          },
        };
      }) || [],
    subtotal: cart.estimatedCost?.subtotalAmount || null,
    total: cart.estimatedCost?.totalAmount || null,
  };
}

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Create a new cart
 *     description: Creates an empty Shopify cart
 *     responses:
 *       201:
 *         description: Cart created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res, next) => {
  try {
    const query = gql`
      mutation CreateCart {
        cartCreate {
          cart {
            ${CART_FRAGMENT}
          }
        }
      }
    `;

    const data = await client.request(query);
    const cart = transformCart(data.cartCreate.cart);
    res.status(201).json({ cart });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cart/{cartId}:
 *   get:
 *     summary: Get cart by ID
 *     description: Retrieve an existing cart's contents
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Shopify cart GID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */
router.get('/:cartId', async (req, res, next) => {
  try {
    const { cartId } = req.params;

    const query = gql`
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          ${CART_FRAGMENT}
        }
      }
    `;

    const data = await client.request(query, { cartId });

    if (!data.cart) {
      return res.status(404).json({ error: { message: 'Cart not found', status: 404 } });
    }

    const cart = transformCart(data.cart);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cart/{cartId}/lines:
 *   post:
 *     summary: Add items to cart
 *     description: Add one or more product variants to the cart
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - merchandiseId
 *                     - quantity
 *                   properties:
 *                     merchandiseId:
 *                       type: string
 *                       description: The variant GID
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       200:
 *         description: Items added successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/:cartId/lines', async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { lines } = req.body;

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        error: { message: 'Request body must include a non-empty "lines" array', status: 400 },
      });
    }

    const query = gql`
      mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FRAGMENT}
          }
        }
      }
    `;

    const data = await client.request(query, { cartId, lines });
    const cart = transformCart(data.cartLinesAdd.cart);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cart/{cartId}/lines:
 *   put:
 *     summary: Update cart line quantities
 *     description: Update the quantity of existing line items
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - quantity
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The cart line ID
 *                     quantity:
 *                       type: integer
 *                       minimum: 0
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.put('/:cartId/lines', async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { lines } = req.body;

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        error: { message: 'Request body must include a non-empty "lines" array', status: 400 },
      });
    }

    const query = gql`
      mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FRAGMENT}
          }
        }
      }
    `;

    const data = await client.request(query, { cartId, lines });
    const cart = transformCart(data.cartLinesUpdate.cart);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cart/{cartId}/lines/{lineId}:
 *   delete:
 *     summary: Remove a line item from cart
 *     description: Remove a specific item from the cart
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lineId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       500:
 *         description: Server error
 */
router.delete('/:cartId/lines/:lineId', async (req, res, next) => {
  try {
    const { cartId, lineId } = req.params;

    const query = gql`
      mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ${CART_FRAGMENT}
          }
        }
      }
    `;

    const data = await client.request(query, { cartId, lineIds: [lineId] });
    const cart = transformCart(data.cartLinesRemove.cart);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
