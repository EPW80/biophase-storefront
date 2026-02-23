/**
 * Shopify Storefront API client for cart operations.
 *
 * This module is imported ONLY by server-side API routes (pages/api/cart/*).
 * The token is never exposed to the browser.
 *
 * Authentication modes:
 *   - **Tokenless**: Cart, products, collections, search (1,000 complexity limit)
 *   - **Public token**: Same as tokenless, but capacity scales with buyer IPs.
 *                       Safe to use client-side (prefix: shpua_).
 *   - **Private token**: Full access including metafields, metaobjects,
 *                        customers, menus. Server-side only (prefix: shpss_).
 *
 * Set SHOPIFY_STOREFRONT_ACCESS_TOKEN for token-based access; omit for tokenless.
 * Either a public or private token works here since this runs server-side.
 */

const domain = process.env.SHOPIFY_STORE_URL;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || null;

if (!domain) {
  throw new Error(
    'Missing SHOPIFY_STORE_URL. Add it to .env.local. See .env.example for reference.'
  );
}

const STOREFRONT_ENDPOINT = `https://${domain}/api/2026-01/graphql.json`;

/**
 * Execute a GraphQL query against the Shopify Storefront API.
 *
 * When SHOPIFY_STOREFRONT_ACCESS_TOKEN is set, requests are token-authenticated
 * (full API access). Otherwise, tokenless access is used (cart, products,
 * collections, search — 1,000 query complexity limit).
 *
 * @param {string} query - GraphQL query/mutation
 * @param {Object} variables - Query variables
 * @returns {Object} Parsed response data
 */
export async function storefrontFetch(query, variables = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (storefrontToken) {
    headers['X-Shopify-Storefront-Access-Token'] = storefrontToken;
  }

  const res = await fetch(STOREFRONT_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const body = await res.text();

    // Detect "channel is locked" in HTTP error responses (often 400)
    if (/channel is locked/i.test(body)) {
      const hint = storefrontToken
        ? 'Ensure the sales channel associated with your Storefront Access Token is active.'
        : 'Either unlock the Online Store channel in Shopify Admin → Settings → Sales channels, '
          + 'or create a Storefront Access Token (Settings → Apps → Develop apps) and add it '
          + 'to .env.local as SHOPIFY_STOREFRONT_ACCESS_TOKEN.';
      throw new Error(`Shopify sales channel is locked. ${hint}`);
    }

    throw new Error(`Storefront API error (${res.status}): ${body}`);
  }

  const json = await res.json();

  if (json.errors) {
    // Detect "Online Store channel is locked" — common on dev stores without
    // an active Online Store or a Storefront Access Token.
    const channelLocked = json.errors.some((e) =>
      /channel is locked/i.test(e.message)
    );
    if (channelLocked) {
      const hint = storefrontToken
        ? 'Ensure the sales channel associated with your Storefront Access Token is active.'
        : 'Either unlock the Online Store channel in Shopify Admin → Settings → Sales channels, '
          + 'or create a Storefront Access Token (Settings → Apps → Develop apps) and add it '
          + 'to .env.local as SHOPIFY_STOREFRONT_ACCESS_TOKEN.';
      throw new Error(`Shopify sales channel is locked. ${hint}`);
    }

    throw new Error(
      `Storefront GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`
    );
  }

  return json.data;
}

// ---------------------------------------------------------------------------
// Cart fragment — shared fields returned by all cart mutations
// ---------------------------------------------------------------------------

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
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
  }
`;

// ---------------------------------------------------------------------------
// Cart mutations
// ---------------------------------------------------------------------------

/**
 * Create a new Shopify cart with optional initial line items.
 * @param {Array<{merchandiseId: string, quantity: number}>} lines
 * @returns {Object} Cart object
 */
export async function cartCreate(lines = []) {
  const mutation = `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const data = await storefrontFetch(mutation, {
    input: { lines },
  });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(
      `Cart creation failed: ${data.cartCreate.userErrors.map((e) => e.message).join(', ')}`
    );
  }

  return data.cartCreate.cart;
}

/**
 * Add line items to an existing Shopify cart.
 * @param {string} cartId - The Shopify cart GID
 * @param {Array<{merchandiseId: string, quantity: number}>} lines
 * @returns {Object} Updated cart object
 */
export async function cartLinesAdd(cartId, lines) {
  const mutation = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const data = await storefrontFetch(mutation, { cartId, lines });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(
      `Add to cart failed: ${data.cartLinesAdd.userErrors.map((e) => e.message).join(', ')}`
    );
  }

  return data.cartLinesAdd.cart;
}

/**
 * Update line item quantities in a Shopify cart.
 * @param {string} cartId - The Shopify cart GID
 * @param {Array<{id: string, quantity: number}>} lines
 * @returns {Object} Updated cart object
 */
export async function cartLinesUpdate(cartId, lines) {
  const mutation = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const data = await storefrontFetch(mutation, { cartId, lines });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(
      `Cart update failed: ${data.cartLinesUpdate.userErrors.map((e) => e.message).join(', ')}`
    );
  }

  return data.cartLinesUpdate.cart;
}

/**
 * Remove line items from a Shopify cart.
 * @param {string} cartId - The Shopify cart GID
 * @param {Array<string>} lineIds - Array of cart line GIDs to remove
 * @returns {Object} Updated cart object
 */
export async function cartLinesRemove(cartId, lineIds) {
  const mutation = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const data = await storefrontFetch(mutation, { cartId, lineIds });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(
      `Cart remove failed: ${data.cartLinesRemove.userErrors.map((e) => e.message).join(', ')}`
    );
  }

  return data.cartLinesRemove.cart;
}
