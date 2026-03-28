import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "foodrush_cart";

const EMPTY_CART = { restaurantId: null, restaurantName: "", items: [] };

const readCart = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = (restaurantId, restaurantName, itemInfo) => {
    setCart((prev) => {
      const base = prev.restaurantId === restaurantId ? prev : { restaurantId, restaurantName, items: [] };
      const existing = base.items.find((i) => i.id === itemInfo.id);
      return {
        ...base,
        items: existing
          ? base.items.map((i) => i.id === itemInfo.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...base.items, { ...itemInfo, quantity: 1 }],
      };
    });
  };

  const removeItem = (itemId) =>
    setCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== itemId) }));

  const updateQuantity = (itemId, delta) =>
    setCart((prev) => ({
      ...prev,
      items: prev.items
        .map((i) => i.id === itemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0),
    }));

  const clearCart = () => setCart(EMPTY_CART);

  const getTotal = () => cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const getItemCount = () => cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const getItemQuantity = (itemId) => cart.items.find((i) => i.id === itemId)?.quantity ?? 0;

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount, getItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
