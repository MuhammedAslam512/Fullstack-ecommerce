import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart from MongoDB whenever user logs in or session loads
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalAmount: 0 });
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // ── 1. ADD ITEM TO CART ─────────────────────────────────────
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart!');
      return false;
    }

    try {
      const res = await api.post('/cart', { productId, quantity });
      if (res.data.success) {
        await fetchCart(); // Refresh cart from DB
        return true;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  };

  // ── 2. UPDATE ITEM QUANTITY ────────────────────────────────
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  // ── 3. REMOVE ITEM FROM CART ────────────────────────────────
  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data.success) {
        await fetchCart();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  // ── 4. CLEAR ENTIRE CART ────────────────────────────────────
  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.data.success) {
        setCart({ items: [], totalAmount: 0 });
      }
    } catch (err) {
      alert('Failed to clear cart');
    }
  };

  // Calculate total item count for badge
  const totalItemCount = cart.items
    ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);