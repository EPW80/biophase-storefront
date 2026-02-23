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
