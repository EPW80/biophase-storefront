import { createContext, useContext, useReducer, useEffect } from 'react';
import {
  createCart,
  addToCart,
  updateCartLines,
  removeCartLines,
  getCart,
} from './shopify';

const CartContext = createContext();

const CART_STORAGE_KEY = 'biophase_cart_id';

const initialState = {
  cartId: null,
  cart: null,
  loading: false,
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        cartId: action.payload?.id || null,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR_CART':
      return { ...initialState };
    default:
      return state;
  }
}

/**
 * Get the total number of items in the cart
 */
function getCartItemCount(cart) {
  if (!cart?.lines?.edges) return 0;
  return cart.lines.edges.reduce((total, edge) => total + edge.node.quantity, 0);
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Restore cart from localStorage on mount
  useEffect(() => {
    const storedCartId = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCartId) {
      dispatch({ type: 'SET_LOADING' });
      getCart(storedCartId)
        .then((cart) => {
          if (cart) {
            dispatch({ type: 'SET_CART', payload: cart });
          } else {
            localStorage.removeItem(CART_STORAGE_KEY);
            dispatch({ type: 'CLEAR_CART' });
          }
        })
        .catch(() => {
          localStorage.removeItem(CART_STORAGE_KEY);
          dispatch({ type: 'CLEAR_CART' });
        });
    }
  }, []);

  // Persist cartId to localStorage whenever it changes
  useEffect(() => {
    if (state.cartId) {
      localStorage.setItem(CART_STORAGE_KEY, state.cartId);
    }
  }, [state.cartId]);

  /**
   * Add an item to the cart. Creates a new cart if none exists.
   * @param {string} variantId - The variant merchandise ID
   * @param {number} quantity - Quantity to add (default: 1)
   */
  async function handleAddToCart(variantId, quantity = 1) {
    dispatch({ type: 'SET_LOADING' });
    try {
      let cart;
      if (!state.cartId) {
        // Create a new cart first
        cart = await createCart();
        dispatch({ type: 'SET_CART', payload: cart });
      }

      const cartId = cart?.id || state.cartId;
      const updatedCart = await addToCart(cartId, [
        { merchandiseId: variantId, quantity },
      ]);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }

  /**
   * Update a cart line item's quantity
   * @param {string} lineId - The cart line ID
   * @param {number} quantity - New quantity
   */
  async function handleUpdateQuantity(lineId, quantity) {
    dispatch({ type: 'SET_LOADING' });
    try {
      if (quantity <= 0) {
        const updatedCart = await removeCartLines(state.cartId, [lineId]);
        dispatch({ type: 'SET_CART', payload: updatedCart });
      } else {
        const updatedCart = await updateCartLines(state.cartId, [
          { id: lineId, quantity },
        ]);
        dispatch({ type: 'SET_CART', payload: updatedCart });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }

  /**
   * Remove a line item from the cart
   * @param {string} lineId - The cart line ID to remove
   */
  async function handleRemoveItem(lineId) {
    dispatch({ type: 'SET_LOADING' });
    try {
      const updatedCart = await removeCartLines(state.cartId, [lineId]);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }

  const itemCount = getCartItemCount(state.cart);

  const value = {
    cart: state.cart,
    cartId: state.cartId,
    loading: state.loading,
    error: state.error,
    itemCount,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
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
