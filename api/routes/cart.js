const express = require('express');
const router = express.Router();

/**
 * In-memory cart store.
 *
 * Cart management is handled client-side in the React app (localStorage).
 * These API endpoints provide a RESTful demonstration layer using an
 * in-memory Map so the Express proxy still showcases CRUD operations,
 * request validation, and Swagger-documented endpoints.
 */
const carts = new Map();

let nextCartId = 1;
let nextLineId = 1;

function generateCartId() {
  return `cart_${nextCartId++}`;
}

function generateLineId() {
  return `line_${nextLineId++}`;
}

function computeTotals(lines) {
  const sum = lines.reduce(
    (acc, l) => acc + parseFloat(l.price) * l.quantity,
    0
  );
  return {
    subtotal: { amount: sum.toFixed(2), currencyCode: 'USD' },
    total: { amount: sum.toFixed(2), currencyCode: 'USD' },
  };
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CartLine:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         merchandiseId:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: string
 *     Cart:
 *       type: object
 *       properties:
 *         id:
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

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Create a new cart
 *     description: Creates an empty in-memory cart
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
 */
router.post('/', (req, res) => {
  const id = generateCartId();
  const cart = { id, lines: [], ...computeTotals([]) };
  carts.set(id, cart);
  res.status(201).json({ cart });
});

/**
 * @swagger
 * /api/cart/{cartId}:
 *   get:
 *     summary: Get cart by ID
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Cart not found
 */
router.get('/:cartId', (req, res) => {
  const cart = carts.get(req.params.cartId);
  if (!cart) {
    return res.status(404).json({ error: { message: 'Cart not found', status: 404 } });
  }
  res.json({ cart });
});

/**
 * @swagger
 * /api/cart/{cartId}/lines:
 *   post:
 *     summary: Add items to cart
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
 *                   required: [merchandiseId, quantity]
 *                   properties:
 *                     merchandiseId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     price:
 *                       type: string
 *                       description: Unit price (default "0.00")
 *     responses:
 *       200:
 *         description: Items added successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Cart not found
 */
router.post('/:cartId/lines', (req, res) => {
  const cart = carts.get(req.params.cartId);
  if (!cart) {
    return res.status(404).json({ error: { message: 'Cart not found', status: 404 } });
  }

  const { lines } = req.body;
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({
      error: { message: 'Request body must include a non-empty "lines" array', status: 400 },
    });
  }

  for (const line of lines) {
    const existing = cart.lines.find((l) => l.merchandiseId === line.merchandiseId);
    if (existing) {
      existing.quantity += line.quantity || 1;
    } else {
      cart.lines.push({
        id: generateLineId(),
        merchandiseId: line.merchandiseId,
        quantity: line.quantity || 1,
        price: line.price || '0.00',
      });
    }
  }

  Object.assign(cart, computeTotals(cart.lines));
  res.json({ cart });
});

/**
 * @swagger
 * /api/cart/{cartId}/lines:
 *   put:
 *     summary: Update cart line quantities
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
 *                   required: [id, quantity]
 *                   properties:
 *                     id:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 0
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Cart not found
 */
router.put('/:cartId/lines', (req, res) => {
  const cart = carts.get(req.params.cartId);
  if (!cart) {
    return res.status(404).json({ error: { message: 'Cart not found', status: 404 } });
  }

  const { lines } = req.body;
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({
      error: { message: 'Request body must include a non-empty "lines" array', status: 400 },
    });
  }

  for (const update of lines) {
    const idx = cart.lines.findIndex((l) => l.id === update.id);
    if (idx !== -1) {
      if (update.quantity <= 0) {
        cart.lines.splice(idx, 1);
      } else {
        cart.lines[idx].quantity = update.quantity;
      }
    }
  }

  Object.assign(cart, computeTotals(cart.lines));
  res.json({ cart });
});

/**
 * @swagger
 * /api/cart/{cartId}/lines/{lineId}:
 *   delete:
 *     summary: Remove a line item from cart
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
 *       404:
 *         description: Cart not found
 */
router.delete('/:cartId/lines/:lineId', (req, res) => {
  const cart = carts.get(req.params.cartId);
  if (!cart) {
    return res.status(404).json({ error: { message: 'Cart not found', status: 404 } });
  }

  cart.lines = cart.lines.filter((l) => l.id !== req.params.lineId);
  Object.assign(cart, computeTotals(cart.lines));
  res.json({ cart });
});

module.exports = router;
