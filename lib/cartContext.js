import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'biophase_cart';

/**
 * Cart item shape (derived from Shopify Cart API lines):
 * {
 *   id: string,           // Shopify cart line GID
 *   variantId: string,    // Shopify variant GID
 *   productTitle: string,
 *   productHandle: string,
 *   variantTitle: string,
 *   price: string,        // e.g. "749.95"
 *   currencyCode: string, // e.g. "USD"
 *   quantity: number,
 *   imageUrl: string | null,
 *   imageAlt: string,
 * }
 */

const initialState = {
  cartId: null,
  checkoutUrl: null,
  items: [],
  loading: false,
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cartId: action.payload.cartId,
        checkoutUrl: action.payload.checkoutUrl,
        items: action.payload.items,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR_CART':
      return { ...initialState };
    default:
      return state;
  }
}

/**
 * Transform Shopify Cart API response into our local item shape.
 * @param {Object} cart - Raw Shopify cart object from the API
 * @returns {{ cartId: string, checkoutUrl: string, items: Array }}
 */
function normalizeCart(cart) {
  const items = cart.lines.edges.map((edge) => {
    const line = edge.node;
    const variant = line.merchandise;
    const product = variant.product;
    const image = product.images?.edges?.[0]?.node;

    return {
      id: line.id,
      variantId: variant.id,
      productTitle: product.title,
      productHandle: product.handle,
      variantTitle: variant.title,
      price: variant.priceV2.amount,
      currencyCode: variant.priceV2.currencyCode,
      quantity: line.quantity,
      imageUrl: image?.url || null,
      imageAlt: image?.altText || product.title,
    };
  });

  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl,
    items,
  };
}

/**
 * Save cart identifiers to localStorage for session persistence.
 * Only the cartId is needed — the full cart is re-fetched from Shopify.
 */
function persistCartId(cartId) {
  if (cartId) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ cartId }));
  } else {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}

/** Load stored cartId from localStorage */
function loadCartId() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.cartId || null;
    }
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
  return null;
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Restore cartId from localStorage on mount — we don't re-fetch the full
  // cart here because it would add a visible loading delay on every page.
  // The cartId is enough to let subsequent add/update/remove calls work.
  useEffect(() => {
    const storedCartId = loadCartId();
    if (storedCartId) {
      dispatch({
        type: 'SET_CART',
        payload: { cartId: storedCartId, checkoutUrl: null, items: [] },
      });
    }
  }, []);

  /**
   * Add an item to the cart via the Shopify Storefront API.
   * Creates a new cart on the first add if none exists.
   * @param {Object} product  - Product object (needs title, handle, images)
   * @param {Object} variant  - Variant object (needs id, title, priceV2)
   * @param {number} quantity - Quantity to add (default 1)
   */
  const handleAddToCart = useCallback(async (product, variant, quantity = 1) => {
    dispatch({ type: 'SET_LOADING' });

    try {
      let cart;
      const line = { merchandiseId: variant.id, quantity };

      if (!state.cartId) {
        // No cart yet — create one with this item
        const res = await fetch('/api/cart/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lines: [line] }),
        });
        if (!res.ok) throw new Error('Failed to create cart');
        const data = await res.json();
        cart = data.cart;
      } else {
        // Cart exists — add the line
        const res = await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartId: state.cartId, lines: [line] }),
        });
        if (!res.ok) throw new Error('Failed to add to cart');
        const data = await res.json();
        cart = data.cart;
      }

      const normalized = normalizeCart(cart);
      persistCartId(normalized.cartId);
      dispatch({ type: 'SET_CART', payload: normalized });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [state.cartId]);

  /**
   * Update a cart line item's quantity via the Shopify Storefront API.
   * If quantity falls to 0 or below, the item is removed.
   * @param {string} lineId   - The Shopify cart line GID
   * @param {number} quantity - New quantity
   */
  const handleUpdateQuantity = useCallback(async (lineId, quantity) => {
    if (!state.cartId) return;
    dispatch({ type: 'SET_LOADING' });

    try {
      if (quantity <= 0) {
        // Remove instead
        const res = await fetch('/api/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartId: state.cartId, lineIds: [lineId] }),
        });
        if (!res.ok) throw new Error('Failed to remove item');
        const data = await res.json();
        const normalized = normalizeCart(data.cart);
        persistCartId(normalized.items.length > 0 ? normalized.cartId : null);
        dispatch({ type: normalized.items.length > 0 ? 'SET_CART' : 'CLEAR_CART', payload: normalized });
        return;
      }

      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: state.cartId,
          lines: [{ id: lineId, quantity }],
        }),
      });
      if (!res.ok) throw new Error('Failed to update cart');
      const data = await res.json();
      const normalized = normalizeCart(data.cart);
      dispatch({ type: 'SET_CART', payload: normalized });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [state.cartId]);

  /**
   * Remove a line item from the cart via the Shopify Storefront API.
   * @param {string} lineId - The Shopify cart line GID
   */
  const handleRemoveItem = useCallback(async (lineId) => {
    if (!state.cartId) return;
    dispatch({ type: 'SET_LOADING' });

    try {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: state.cartId, lineIds: [lineId] }),
      });
      if (!res.ok) throw new Error('Failed to remove item');
      const data = await res.json();
      const normalized = normalizeCart(data.cart);

      if (normalized.items.length === 0) {
        persistCartId(null);
        dispatch({ type: 'CLEAR_CART' });
      } else {
        dispatch({ type: 'SET_CART', payload: normalized });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [state.cartId]);

  /** Clear the entire cart (local only — Shopify carts expire automatically) */
  const handleClearCart = useCallback(() => {
    persistCartId(null);
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = state.items.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.quantity,
    0
  );

  const currencyCode = state.items[0]?.currencyCode || 'USD';

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    cartId: state.cartId,
    checkoutUrl: state.checkoutUrl,
    itemCount,
    subtotal,
    currencyCode,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    clearCart: handleClearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to access cart state and actions
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
