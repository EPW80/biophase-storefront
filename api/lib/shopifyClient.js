const { GraphQLClient, gql } = require("graphql-request");

const domain = process.env.SHOPIFY_STORE_URL;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

// Validate required environment variables at module load
const requiredEnvVars = {
  SHOPIFY_STORE_URL: domain,
  SHOPIFY_CLIENT_ID: clientId,
  SHOPIFY_CLIENT_SECRET: clientSecret,
};
const missing = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
    'Create a .env file in the api/ directory with these values.'
  );
}

const endpoint = `https://${domain}/admin/api/2026-01/graphql.json`;

// --- Client Credentials Grant: token cache ---
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Exchange client_id + client_secret for a short-lived access token.
 * Tokens are valid for ~24 h; we refresh 5 min early to avoid races.
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
    const text = await res.text();
    throw new Error(`Shopify token exchange failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  cachedToken = json.access_token;
  // Default 24 h minus 5 min safety margin
  const expiresInMs = (json.expires_in || 86400) * 1000 - 5 * 60 * 1000;
  tokenExpiresAt = now + expiresInMs;

  return cachedToken;
}

/**
 * Return a ready-to-use GraphQLClient with a fresh access token.
 */
async function getClient() {
  const token = await getAccessToken();
  return new GraphQLClient(endpoint, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
}

module.exports = { getClient, gql };
