import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'biophase_cart';

/**
 * Cart item shape:
 * {
 *   id: string,           // generated line-item ID (e.g. "line_abc123")
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
  items: [],
  loading: false,
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false, error: null };
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

/** Generate a unique line-item ID */
function generateLineId() {
  return 'line_' + Math.random().toString(36).substring(2, 10);
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        if (Array.isArray(items) && items.length > 0) {
          dispatch({ type: 'SET_ITEMS', payload: items });
        }
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [state.items]);

  /**
   * Add an item to the cart.
   * If the same variant already exists, its quantity is incremented.
   * @param {Object} product  - Product object from Shopify (needs title, handle, images)
   * @param {Object} variant  - Variant object (needs id, title, priceV2)
   * @param {number} quantity - Quantity to add (default 1)
   */
  function handleAddToCart(product, variant, quantity = 1) {
    const existing = state.items.find((i) => i.variantId === variant.id);
    let updated;

    if (existing) {
      updated = state.items.map((i) =>
        i.variantId === variant.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      const image = product.images?.edges?.[0]?.node;
      const newItem = {
        id: generateLineId(),
        variantId: variant.id,
        productTitle: product.title,
        productHandle: product.handle,
        variantTitle: variant.title,
        price: variant.priceV2.amount,
        currencyCode: variant.priceV2.currencyCode,
        quantity,
        imageUrl: image?.url || null,
        imageAlt: image?.altText || product.title,
      };
      updated = [...state.items, newItem];
    }

    dispatch({ type: 'SET_ITEMS', payload: updated });
  }

  /**
   * Update a cart line item's quantity.
   * If quantity falls to 0 or below, the item is removed.
   * @param {string} lineId   - The local line-item ID
   * @param {number} quantity - New quantity
   */
  function handleUpdateQuantity(lineId, quantity) {
    if (quantity <= 0) {
      handleRemoveItem(lineId);
      return;
    }
    const updated = state.items.map((i) =>
      i.id === lineId ? { ...i, quantity } : i
    );
    dispatch({ type: 'SET_ITEMS', payload: updated });
  }

  /**
   * Remove a line item from the cart.
   * @param {string} lineId - The local line-item ID
   */
  function handleRemoveItem(lineId) {
    const updated = state.items.filter((i) => i.id !== lineId);
    dispatch({ type: 'SET_ITEMS', payload: updated });
  }

  /** Clear the entire cart */
  function handleClearCart() {
    dispatch({ type: 'CLEAR_CART' });
  }

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
