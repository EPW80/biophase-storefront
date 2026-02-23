import { GraphQLClient, gql } from 'graphql-request';

const domain = process.env.SHOPIFY_STORE_URL;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const endpoint = `https://${domain}/api/2024-01/graphql.json`;

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all products from the Shopify Storefront API
 * @param {number} first - Number of products to fetch (default: 20)
 * @returns {Array} Array of product objects
 */
export async function getProducts(first = 20) {
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

  const data = await graphQLClient.request(query, { first });
  return data.products.edges.map((edge) => edge.node);
}

/**
 * Fetch a single product by handle
 * @param {string} handle - The product handle (URL slug)
 * @returns {Object} Product object
 */
export async function getProductByHandle(handle) {
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

  const data = await graphQLClient.request(query, { handle });
  return data.productByHandle;
}

/**
 * Fetch all product handles for static path generation
 * @returns {Array} Array of handle strings
 */
export async function getAllProductHandles() {
  const query = gql`
    query GetAllHandles {
      products(first: 100) {
        edges {
          node {
            handle
          }
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  return data.products.edges.map((edge) => edge.node.handle);
}

/**
 * Create a new cart
 * @returns {Object} Cart object with id and checkoutUrl
 */
export async function createCart() {
  const query = gql`
    mutation CreateCart {
      cartCreate {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
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
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  return data.cartCreate.cart;
}

/**
 * Add items to an existing cart
 * @param {string} cartId - The cart ID
 * @param {Array} lines - Array of { merchandiseId, quantity }
 * @returns {Object} Updated cart object
 */
export async function addToCart(cartId, lines) {
  const query = gql`
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
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
        }
      }
    }
  `;

  const data = await graphQLClient.request(query, { cartId, lines });
  return data.cartLinesAdd.cart;
}

/**
 * Update cart line quantities
 * @param {string} cartId - The cart ID
 * @param {Array} lines - Array of { id, quantity }
 * @returns {Object} Updated cart object
 */
export async function updateCartLines(cartId, lines) {
  const query = gql`
    mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
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
        }
      }
    }
  `;

  const data = await graphQLClient.request(query, { cartId, lines });
  return data.cartLinesUpdate.cart;
}

/**
 * Remove lines from cart
 * @param {string} cartId - The cart ID
 * @param {Array} lineIds - Array of line item IDs to remove
 * @returns {Object} Updated cart object
 */
export async function removeCartLines(cartId, lineIds) {
  const query = gql`
    mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
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
        }
      }
    }
  `;

  const data = await graphQLClient.request(query, { cartId, lineIds });
  return data.cartLinesRemove.cart;
}

/**
 * Get an existing cart by ID
 * @param {string} cartId - The cart ID
 * @returns {Object} Cart object
 */
export async function getCart(cartId) {
  const query = gql`
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
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
      }
    }
  `;

  const data = await graphQLClient.request(query, { cartId });
  return data.cart;
}

/**
 * Format a Shopify money amount for display
 * @param {string} amount - The amount string
 * @param {string} currencyCode - The currency code (e.g. 'USD')
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}
