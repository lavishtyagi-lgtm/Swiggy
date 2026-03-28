import RestaurantCard from "./RestaurantCard";
import { useEffect, useState, useMemo } from "react";
import Shimmer from "./Shimmer";
import { Link, useNavigate } from "react-router-dom";
import { getRestaurantsUrl, getStoredCity } from "../utils/constants";
import { useOnlineStatus } from "../utils/useOnlineStatus";
import { useFavourites } from "../utils/useFavourites";
import { usePreferences } from "../utils/usePreferences";

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("foodrush_user")) || null; }
  catch { return null; }
};

// ─── Filter Definitions ────────────────────────────────────────────────────────

const QUICK_FILTERS = [
  { id: "top-rated",     label: "⭐ Top Rated",    fn: (r) => r.info.avgRating >= 4 },
  { id: "fast-delivery", label: "🚀 Fast Delivery", fn: (r) => r.info.sla?.deliveryTime <= 30 },
  { id: "pure-veg",      label: "🥦 Pure Veg",      fn: (r) => r.info.veg },
];

const parseCost = (str) => parseInt((str || "0").replace(/[^\d]/g, "")) || 0;

const PRICE_FILTERS = [
  { id: "under-200", label: "Under ₹200",  fn: (r) => parseCost(r.info.costForTwo) < 200 },
  { id: "200-400",   label: "₹200 – ₹400", fn: (r) => { const p = parseCost(r.info.costForTwo); return p >= 200 && p <= 400; } },
  { id: "400-600",   label: "₹400 – ₹600", fn: (r) => { const p = parseCost(r.info.costForTwo); return p > 400 && p <= 600; } },
  { id: "600-plus",  label: "₹600+",       fn: (r) => parseCost(r.info.costForTwo) > 600 },
];

// ─── Pure Helpers (no hooks, no side-effects) ──────────────────────────────────

const applyAllFilters = (list, filters, search) => {
  let result = list;
  if (filters.quick) {
    const f = QUICK_FILTERS.find((q) => q.id === filters.quick);
    if (f) result = result.filter(f.fn);
  }
  if (filters.price) {
    const f = PRICE_FILTERS.find((p) => p.id === filters.price);
    if (f) result = result.filter(f.fn);
  }
  if (filters.cuisine) {
    result = result.filter((r) => r.info.cuisines?.includes(filters.cuisine));
  }
  if (search.trim()) {
    result = result.filter((r) => r.info.name.toLowerCase().includes(search.toLowerCase()));
  }
  return result;
};

const extractTopCuisines = (restaurants, limit = 14) => {
  const counts = {};
  restaurants.forEach((r) => {
    r.info.cuisines?.forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([cuisine]) => cuisine);
};

const getRecentOrderedIds = () => {
  try {
    const orders = JSON.parse(localStorage.getItem("foodrush_orders") || "[]");
    const seen = new Set();
    return orders
      .filter((o) => { if (seen.has(o.restaurantId)) return false; seen.add(o.restaurantId); return true; })
      .slice(0, 6)
      .map((o) => o.restaurantId);
  } catch { return []; }
};

const EMPTY_FILTERS = { quick: null, price: null, cuisine: null };
const isFiltering = (f, s) => f.quick || f.price || f.cuisine || s.trim();

// ─── Sub-components ────────────────────────────────────────────────────────────

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-all ${
      active
        ? "bg-gray-900 text-white border-gray-900"
        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
    }`}
  >
    {label}
  </button>
);

const HorizontalStrip = ({ title, restaurants, isFavourite, onToggleFavourite, onCardClick }) => {
  if (restaurants.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-gray-800 mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.info.id}
            to={"/restaurants/" + restaurant.info.id}
            className="w-44 shrink-0"
            onClick={() => onCardClick?.(restaurant.info.cuisines)}
          >
            <RestaurantCard
              resInfo={restaurant}
              isFavourite={isFavourite(restaurant.info.id)}
              onToggleFavourite={onToggleFavourite}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const Body = () => {
  const [listofRestaurants, setlistofRestaurants] = useState([]);
  const [searchText, setSearchText]               = useState("");
  const [filters, setFilters]                     = useState(EMPTY_FILTERS);
  const [error, setError]                         = useState(null);

  const onlineStatus                        = useOnlineStatus();
  const { isFavourite, toggleFavourite }    = useFavourites();
  const { trackCuisines, getTopPreferred }  = usePreferences();
  const navigate                            = useNavigate();
  const user                                = useMemo(() => readUser(), []);

  useEffect(() => {
    fetchData();
    window.addEventListener("citychange", fetchData);
    return () => window.removeEventListener("citychange", fetchData);
  }, []);

  const fetchData = async () => {
    setlistofRestaurants([]);
    setError(null);
    setFilters(EMPTY_FILTERS);
    setSearchText("");
    try {
      const city = getStoredCity();
      const res  = await fetch(getRestaurantsUrl(city.lat, city.lng));
      if (!res.ok) throw new Error("Failed to reach the proxy server.");
      const json = await res.json();
      const restaurants = json?.data?.cards[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants;
      if (!restaurants) throw new Error("Could not parse restaurant data. Swiggy may have updated their API.");
      setlistofRestaurants(restaurants);
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Derived state via useMemo (no manual setState for filters) ──────────────
  const filteredRestaurants = useMemo(
    () => applyAllFilters(listofRestaurants, filters, searchText),
    [listofRestaurants, filters, searchText]
  );

  const topCuisines = useMemo(
    () => extractTopCuisines(listofRestaurants),
    [listofRestaurants]
  );

  // Phase 4: Recommended — restaurants whose cuisines match your top preferences
  const recommendations = useMemo(() => {
    const preferred = getTopPreferred(5);
    if (preferred.length === 0) return [];
    return listofRestaurants
      .map((r) => ({ r, score: r.info.cuisines?.filter((c) => preferred.includes(c)).length || 0 }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ r }) => r);
  }, [listofRestaurants]);

  // Phase 4: Recently ordered — cross-reference history with live restaurants
  const recentlyOrdered = useMemo(() => {
    const ids = getRecentOrderedIds();
    return ids
      .map((id) => listofRestaurants.find((r) => r.info.id === id))
      .filter(Boolean);
  }, [listofRestaurants]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const toggleFilter = (type, id) =>
    setFilters((prev) => ({ ...prev, [type]: prev[type] === id ? null : id }));

  const handleClear = () => { setSearchText(""); setFilters(EMPTY_FILTERS); };

  const handleSurpriseMe = () => {
    const pool = filteredRestaurants.length > 0 ? filteredRestaurants : listofRestaurants;
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    trackCuisines(pick.info.cuisines);
    navigate("/restaurants/" + pick.info.id);
  };

  const browsing = !isFiltering(filters, searchText);

  // ── Early returns ────────────────────────────────────────────────────────────
  if (onlineStatus === false) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-5xl mb-4">📡</p>
        <h2 className="text-xl font-bold text-gray-800 mb-1">You're offline</h2>
        <p className="text-gray-500 text-sm">Please check your internet connection</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-5xl mb-4">🔌</p>
        <h2 className="text-xl font-bold text-red-500 mb-1">Something went wrong</h2>
        <p className="text-gray-500 mb-2 text-sm">{error}</p>
        <code className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">npm run server</code>
      </div>
    );
  }

  if (listofRestaurants.length === 0) return <Shimmer />;

  const anyActive = isFiltering(filters, searchText);

  return (
    <div className="max-w-7xl mx-auto px-4">

      {/* ── Hero ── */}
      <div className="py-10 text-center">
        {user ? (
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            Hi {user.name.split(" ")[0]}, what are you{" "}
            <span className="text-orange-500">craving</span> today?
          </h1>
        ) : (
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            What are you <span className="text-orange-500">craving</span> today?
          </h1>
        )}
        <p className="text-gray-500 text-sm mb-6">{listofRestaurants.length} restaurants near you</p>

        <div className="max-w-xl mx-auto flex items-center gap-2 bg-white border-2 border-gray-200 focus-within:border-orange-400 rounded-2xl px-4 py-2 shadow-sm transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
            placeholder="Search for restaurants, cuisines..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && handleClear()}
          />
          {searchText && (
            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>

        <button
          onClick={handleSurpriseMe}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 border-orange-200 text-orange-500 text-sm font-semibold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
        >
          🎲 Surprise Me
        </button>
      </div>

      {/* ── Quick + Price filter chips (one scrollable row) ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {QUICK_FILTERS.map((f) => (
          <FilterChip key={f.id} label={f.label} active={filters.quick === f.id} onClick={() => toggleFilter("quick", f.id)} />
        ))}
        <span className="w-px bg-gray-200 self-stretch shrink-0" />
        {PRICE_FILTERS.map((f) => (
          <FilterChip key={f.id} label={f.label} active={filters.price === f.id} onClick={() => toggleFilter("price", f.id)} />
        ))}
        {anyActive && (
          <button onClick={handleClear} className="px-4 py-1.5 rounded-full text-sm font-medium border border-orange-300 text-orange-500 hover:bg-orange-50 transition-colors whitespace-nowrap shrink-0">
            Clear all
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400 self-center shrink-0 pl-2">
          {filteredRestaurants.length} results
        </span>
      </div>

      {/* ── Cuisine chips (dynamic from API data) ── */}
      {topCuisines.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {topCuisines.map((cuisine) => (
            <FilterChip
              key={cuisine}
              label={cuisine}
              active={filters.cuisine === cuisine}
              onClick={() => toggleFilter("cuisine", cuisine)}
            />
          ))}
        </div>
      )}

      {/* ── Phase 4: Intelligence strips (only when browsing freely) ── */}
      {browsing && (
        <>
          <HorizontalStrip
            title="🕐 Order Again"
            restaurants={recentlyOrdered}
            isFavourite={isFavourite}
            onToggleFavourite={toggleFavourite}
            onCardClick={trackCuisines}
          />
          <HorizontalStrip
            title="✨ Recommended for You"
            restaurants={recommendations}
            isFavourite={isFavourite}
            onToggleFavourite={toggleFavourite}
            onCardClick={trackCuisines}
          />
        </>
      )}

      {/* ── All Restaurants ── */}
      {!browsing && filteredRestaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-gray-700 font-semibold">No restaurants found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or filter</p>
          <button onClick={handleClear} className="mt-4 text-sm text-orange-500 underline">Clear filters</button>
        </div>
      ) : (
        <div>
          {browsing && <h2 className="text-base font-bold text-gray-800 mb-3">All Restaurants</h2>}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.info.id}
                to={"/restaurants/" + restaurant.info.id}
                onClick={() => trackCuisines(restaurant.info.cuisines)}
              >
                <RestaurantCard
                  resInfo={restaurant}
                  isFavourite={isFavourite(restaurant.info.id)}
                  onToggleFavourite={toggleFavourite}
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Body;
