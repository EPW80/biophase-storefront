const domain = process.env.SHOPIFY_STORE_URL;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

const endpoint = `https://${domain}/admin/api/2024-01/graphql.json`;

// --- Token cache (survives across SSG/ISR requests within the same process) ---
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Exchange client credentials for an access token.
 * Tokens are cached in memory and refreshed 5 minutes before expiry.
 */
async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const tokenUrl = `https://${domain}/admin/oauth/access_token`;
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Cache for 23 hours 55 minutes (tokens last 24h, refresh 5 min early)
  tokenExpiresAt =
    now +
    (data.expires_in ? (data.expires_in - 300) * 1000 : 23 * 60 * 60 * 1000);
  return cachedToken;
}

/**
 * Execute a GraphQL query against the Shopify Admin API.
 * Uses plain fetch to avoid bundler compatibility issues with graphql-request v7.
 * @param {string} query - The GraphQL query string
 * @param {Object} variables - Query variables
 * @returns {Object} The parsed data from the response
 */
async function shopifyFetch(query, variables = {}) {
  const token = await getAccessToken();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shopify Admin API error (${res.status}): ${body}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(
      `Shopify GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`
    );
  }

  return json.data;
}

/**
 * Fetch all products from the Shopify Admin API
 * @param {number} first - Number of products to fetch (default: 20)
 * @returns {Array} Array of product objects
 */
export async function getProducts(first = 20) {
  const query = `
    query GetProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            priceRangeV2 {
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
                  price
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { first });
  // Normalize Admin API shape to match component expectations
  return data.products.edges.map((edge) => {
    const node = edge.node;
    return {
      ...node,
      priceRange: {
        minVariantPrice: node.priceRangeV2?.minVariantPrice,
      },
      variants: {
        edges: node.variants.edges.map((ve) => ({
          node: {
            ...ve.node,
            priceV2: {
              amount: ve.node.price,
              currencyCode:
                node.priceRangeV2?.minVariantPrice?.currencyCode || "USD",
            },
          },
        })),
      },
    };
  });
}

/**
 * Fetch a single product by handle
 * @param {string} handle - The product handle (URL slug)
 * @returns {Object} Product object
 */
export async function getProductByHandle(handle) {
  const query = `
    query GetProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        priceRangeV2 {
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
              price
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

  const data = await shopifyFetch(query, { handle });
  const product = data.productByHandle;
  if (!product) return null;
  // Normalize to match Storefront API shape expected by components
  const currency = product.priceRangeV2?.minVariantPrice?.currencyCode || "USD";
  return {
    ...product,
    priceRange: product.priceRangeV2,
    variants: {
      edges: product.variants.edges.map((ve) => ({
        node: {
          ...ve.node,
          priceV2: { amount: ve.node.price, currencyCode: currency },
        },
      })),
    },
  };
}

/**
 * Fetch all product handles for static path generation
 * @returns {Array} Array of handle strings
 */
export async function getAllProductHandles() {
  const query = `
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

  const data = await shopifyFetch(query);
  return data.products.edges.map((edge) => edge.node.handle);
}

/**
 * Format a Shopify money amount for display
 * @param {string} amount - The amount string
 * @param {string} currencyCode - The currency code (e.g. 'USD')
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}
