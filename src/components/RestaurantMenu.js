import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRestrauntMenu } from "../utils/useRestrauntMenu";
import { useCart } from "../utils/CartContext";
import { REST_LOGO_URL } from "../utils/constants";

const getRestaurantInfo = (cards) => cards?.[0]?.card?.card?.info ?? null;

const getMenuCategories = (cards) => {
  const groupedCard = cards?.find((c) => c.groupedCard);
  const regularCards = groupedCard?.groupedCard?.cardGroupMap?.REGULAR?.cards ?? [];
  return regularCards.filter((c) => c.card?.card?.itemCards?.length > 0);
};

const VegIndicator = ({ isVeg }) => (
  <span
    className={`inline-flex w-3.5 h-3.5 rounded-sm border-2 shrink-0 mt-0.5 ${isVeg ? "border-green-600" : "border-red-600"}`}
    style={{ backgroundColor: isVeg ? "#16a34a" : "#dc2626" }}
    title={isVeg ? "Veg" : "Non-Veg"}
  />
);

const AddButton = ({ item, restaurantId, restaurantName }) => {
  const { addItem, updateQuantity, getItemQuantity, cart, clearCart } = useCart();
  const quantity = getItemQuantity(item.id);

  const handleAdd = () => {
    if (cart.restaurantId && cart.restaurantId !== restaurantId && cart.items.length > 0) {
      const ok = window.confirm(
        `Your cart has items from "${cart.restaurantName}".\nClear cart and add from "${restaurantName}"?`
      );
      if (!ok) return;
      clearCart();
    }
    addItem(restaurantId, restaurantName, {
      id: item.id,
      name: item.name,
      price: (item.price || item.defaultPrice || 0) / 100,
      isVeg: item.isVeg === 1,
      imageId: item.imageId,
    });
  };

  if (quantity === 0) {
    return (
      <button
        onClick={handleAdd}
        className="mt-2 px-5 py-1.5 border-2 border-orange-500 text-orange-500 text-xs font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
      >
        ADD
      </button>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 border-2 border-orange-500 rounded-lg overflow-hidden w-fit">
      <button
        onClick={() => updateQuantity(item.id, -1)}
        className="px-2.5 py-1 text-orange-500 font-bold text-sm hover:bg-orange-50 transition-colors"
      >
        −
      </button>
      <span className="text-orange-500 font-bold text-sm min-w-[16px] text-center">{quantity}</span>
      <button
        onClick={() => addItem(restaurantId, restaurantName, { id: item.id, name: item.name, price: (item.price || item.defaultPrice || 0) / 100, isVeg: item.isVeg === 1, imageId: item.imageId })}
        className="px-2.5 py-1 text-orange-500 font-bold text-sm hover:bg-orange-50 transition-colors"
      >
        +
      </button>
    </div>
  );
};

const MenuItem = ({ item, restaurantId, restaurantName }) => {
  const info = item?.card?.info;
  if (!info) return null;
  const price = (info.price || info.defaultPrice || 0) / 100;
  const isVeg = info.isVeg === 1;

  const isBestseller = info.ribbon?.text?.toLowerCase().includes("bestseller") || info.isBestSeller;

  return (
    <div className="flex justify-between items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <VegIndicator isVeg={isVeg} />
          {isBestseller && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wide leading-none">
              Bestseller
            </span>
          )}
        </div>
        <h4 className="font-semibold text-gray-800 text-sm mt-1 leading-snug">{info.name}</h4>
        {price > 0 && <p className="text-sm font-bold text-gray-700 mt-1">₹{price.toFixed(0)}</p>}
        {info.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{info.description}</p>}
        <AddButton item={info} restaurantId={restaurantId} restaurantName={restaurantName} />
      </div>
      {info.imageId && (
        <img src={REST_LOGO_URL + info.imageId} alt={info.name} className="w-24 h-24 object-cover rounded-xl shrink-0" />
      )}
    </div>
  );
};

const MenuCategory = ({ category, restaurantId, restaurantName, isOpen, onToggle }) => {
  const title = category?.card?.card?.title;
  const items = category?.card?.card?.itemCards ?? [];
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-1 py-4 text-left hover:bg-gray-50 transition-colors rounded-lg">
        <span className="font-bold text-gray-800 text-sm">
          {title} <span className="text-gray-400 font-normal ml-1">({items.length})</span>
        </span>
        <span className={`text-gray-400 text-lg transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>↓</span>
      </button>
      {isOpen && (
        <div className="px-1 pb-2">
          {items.map((item) => (
            <MenuItem key={item?.card?.info?.id} item={item} restaurantId={restaurantId} restaurantName={restaurantName} />
          ))}
        </div>
      )}
    </div>
  );
};

export function RestaurantMenu() {
  const { resId } = useParams();
  const navigate = useNavigate();
  const { resInfo, loading, error } = useRestrauntMenu(resId);
  const [openCategories, setOpenCategories] = useState(new Set([0]));

  const toggleCategory = (index) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-5">
          <div className="h-7 bg-gray-200 rounded-lg w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="mt-8 space-y-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
                <div className="w-24 h-24 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <p className="text-5xl mb-4">🍽️</p>
        <h2 className="text-lg font-bold text-red-500 mb-1">Could not load menu</h2>
        <p className="text-gray-500 text-sm mb-3 max-w-sm">{error}</p>
        <code className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">npm run server</code>
        <button onClick={() => navigate(-1)} className="mt-6 text-sm text-orange-500 underline">← Go back</button>
      </div>
    );
  }

  const cards = resInfo?.cards ?? [];
  const info = getRestaurantInfo(cards);
  const categories = getMenuCategories(cards);
  const ratingColor = info?.avgRating >= 4 ? "bg-green-600" : info?.avgRating >= 3 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-5">
        ← Back
      </button>

      {info && (
        <div className="mb-6 pb-5 border-b-2 border-dashed border-gray-200">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{info.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{info.cuisines?.join(", ")}</p>
          <p className="text-xs text-gray-400 mt-0.5">{info.locality}{info.city ? `, ${info.city}` : ""}</p>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <div className={`flex items-center gap-1.5 ${ratingColor} text-white text-sm font-bold px-3 py-1 rounded-lg`}>
              <span>★</span>
              <span>{info.avgRatingString ?? info.avgRating}</span>
              <span className="font-normal text-xs opacity-80">({info.totalRatingsString})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              🕐 <span className="font-medium">{info.sla?.deliveryTime} mins</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              💰 <span>{info.costForTwo}</span>
            </div>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No menu items available.</p>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-800 text-lg">Menu</h2>
            <button
              className="text-xs text-orange-500 underline"
              onClick={() =>
                setOpenCategories(
                  openCategories.size === categories.length ? new Set() : new Set(categories.map((_, i) => i))
                )
              }
            >
              {openCategories.size === categories.length ? "Collapse all" : "Expand all"}
            </button>
          </div>
          {categories.map((category, i) => (
            <MenuCategory
              key={category?.card?.card?.title ?? i}
              category={category}
              restaurantId={resId}
              restaurantName={info?.name ?? ""}
              isOpen={openCategories.has(i)}
              onToggle={() => toggleCategory(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
