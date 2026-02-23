const express = require('express');
const router = express.Router();
const { client, gql } = require('../lib/shopifyClient');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Shopify product GID
 *         title:
 *           type: string
 *         handle:
 *           type: string
 *           description: URL-friendly slug
 *         description:
 *           type: string
 *         price:
 *           type: object
 *           properties:
 *             amount:
 *               type: string
 *             currencyCode:
 *               type: string
 *         image:
 *           type: object
 *           nullable: true
 *           properties:
 *             url:
 *               type: string
 *             altText:
 *               type: string
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               price:
 *                 type: object
 *               availableForSale:
 *                 type: boolean
 */

/**
 * Transform raw Shopify product data into a clean API response
 */
function transformProduct(node) {
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    descriptionHtml: node.descriptionHtml || null,
    price: node.priceRange?.minVariantPrice || null,
    image: node.images?.edges?.[0]?.node || null,
    images: node.images?.edges?.map((e) => e.node) || [],
    variants:
      node.variants?.edges?.map((e) => ({
        id: e.node.id,
        title: e.node.title,
        price: e.node.priceV2,
        availableForSale: e.node.availableForSale,
        selectedOptions: e.node.selectedOptions || [],
      })) || [],
    options: node.options || [],
  };
}

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List all products
 *     description: Retrieve a list of products from the Shopify store
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 count:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

    const query = gql`
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await client.request(query, { first: limit });
    const products = data.products.edges.map((edge) =>
      transformProduct(edge.node)
    );

    res.json({ products, count: products.length });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products/{handle}:
 *   get:
 *     summary: Get a single product by handle
 *     description: Retrieve detailed product information by its URL handle
 *     parameters:
 *       - in: path
 *         name: handle
 *         required: true
 *         schema:
 *           type: string
 *         description: The product handle (URL slug)
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;

    const query = gql`
      query GetProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          description
          descriptionHtml
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 25) {
            edges {
              node {
                id
                title
                priceV2 {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            id
            name
            values
          }
        }
      }
    `;

    const data = await client.request(query, { handle });

    if (!data.productByHandle) {
      return res.status(404).json({ error: { message: 'Product not found', status: 404 } });
    }

    const product = transformProduct(data.productByHandle);
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
