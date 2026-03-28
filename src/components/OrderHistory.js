import { useState } from "react";
import { Link } from "react-router-dom";

const readOrders = () => {
  try {
    return JSON.parse(localStorage.getItem("foodrush_orders") || "[]");
  } catch {
    return [];
  }
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <p className="font-bold text-gray-800 text-sm">{order.restaurantName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.placedAt)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""} · <span className="font-semibold">₹{order.total}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Placed</span>
          <span className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}>↓</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="space-y-2 mt-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="font-medium text-gray-800">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <Link
            to={"/restaurants/" + order.restaurantId}
            className="mt-4 block text-center text-xs text-orange-500 underline"
          >
            Order again from {order.restaurantName}
          </Link>
        </div>
      )}
    </div>
  );
};

export function OrderHistory() {
  const [orders, setOrders] = useState(readOrders);

  const handleClear = () => {
    if (window.confirm("Clear all order history?")) {
      localStorage.removeItem("foodrush_orders");
      setOrders([]);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-6xl mb-4">🧾</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
        <p className="text-gray-400 text-sm mb-6">Your past orders will appear here</p>
        <Link to="/" className="px-6 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Order History</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} past order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={handleClear} className="text-xs text-red-400 hover:text-red-600 transition-colors underline">
          Clear all
        </button>
      </div>
      <div className="space-y-3">
        {orders.map((order) => <OrderCard key={order.id} order={order} />)}
      </div>
    </div>
  );
}
