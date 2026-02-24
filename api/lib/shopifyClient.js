const domain = process.env.SHOPIFY_STORE_URL;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || null;

if (!domain) {
  throw new Error(
    'Missing SHOPIFY_STORE_URL. Add it to your .env file. See .env.example for reference.'
  );
}

const STOREFRONT_ENDPOINT = `https://${domain}/api/2026-01/graphql.json`;

/**
 * Execute a GraphQL query against the Shopify Storefront API.
 * Uses tokenless access by default; set SHOPIFY_STOREFRONT_ACCESS_TOKEN
 * for higher rate limits or metafield access.
 *
 * @param {string} query - GraphQL query/mutation
 * @param {Object} variables - Query variables
 * @returns {Object} Parsed response data
 */
async function storefrontFetch(query, variables = {}) {
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
    throw new Error(`Storefront API error (${res.status}): ${body}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(
      `Storefront GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`
    );
  }

  return json.data;
}

module.exports = { storefrontFetch };
