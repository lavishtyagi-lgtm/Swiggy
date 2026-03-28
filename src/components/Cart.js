import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../utils/CartContext";
import { REST_LOGO_URL } from "../utils/constants";

const DELIVERY_FEE = 30;

const saveOrder = (cart, total) => {
  try {
    const orders = JSON.parse(localStorage.getItem("foodrush_orders") || "[]");
    orders.unshift({
      id: Date.now(),
      placedAt: new Date().toISOString(),
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
      items: cart.items,
      total: total + DELIVERY_FEE,
    });
    localStorage.setItem("foodrush_orders", JSON.stringify(orders));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
};

export function Cart() {
  const { cart, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const navigate = useNavigate();

  const subtotal = getTotal();
  const grandTotal = subtotal + DELIVERY_FEE;

  const handlePlaceOrder = () => {
    saveOrder(cart, subtotal);
    clearCart();
    navigate("/history");
  };

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-6">Add items from a restaurant to get started</p>
        <Link to="/" className="px-6 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-1">Your Cart</h1>
      <p className="text-sm text-gray-400 mb-6">
        {getItemCount()} item{getItemCount() !== 1 ? "s" : ""} from{" "}
        <span className="font-semibold text-gray-700">{cart.restaurantName}</span>
      </p>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-4 border-b border-gray-50 last:border-0">
            {item.imageId && (
              <img src={REST_LOGO_URL + item.imageId} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">₹{item.price} × {item.quantity} = <span className="font-bold text-gray-700">₹{(item.price * item.quantity).toFixed(0)}</span></p>
            </div>
            <div className="flex items-center gap-1 border border-orange-400 rounded-lg overflow-hidden shrink-0">
              <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-orange-500 font-bold text-sm hover:bg-orange-50">−</button>
              <span className="px-1 text-sm font-bold text-orange-500">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-orange-500 font-bold text-sm hover:bg-orange-50">+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Bill Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Item total</span><span>₹{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery fee</span><span>₹{DELIVERY_FEE}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
            <span>To pay</span><span>₹{grandTotal.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 text-center mb-4">
        This is a simulated order — no real payment or delivery involved.
      </p>

      {/* CTA */}
      <button
        onClick={handlePlaceOrder}
        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors text-sm"
      >
        Place Order · ₹{grandTotal.toFixed(0)}
      </button>

      <button onClick={clearCart} className="w-full mt-3 text-sm text-gray-400 hover:text-red-400 transition-colors">
        Clear cart
      </button>
    </div>
  );
}
