import { storefrontFetch } from './storefrontClient';

/**
 * Fetch all products from the Shopify Storefront API.
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

  const data = await storefrontFetch(query, { first });
  return data.products.edges.map((edge) => edge.node);
}

/**
 * Fetch a single product by handle.
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

  const data = await storefrontFetch(query, { handle });
  return data.productByHandle || null;
}

/**
 * Fetch all product handles for static path generation.
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

  const data = await storefrontFetch(query);
  return data.products.edges.map((edge) => edge.node.handle);
}
