import { Link, useLocation, useNavigate } from "react-router-dom";
import { LOGO_URL, CITIES, getStoredCity } from "../utils/constants";
import { useState, useRef, useEffect } from "react";
import { useOnlineStatus } from "../utils/useOnlineStatus";
import { useCart } from "../utils/CartContext";

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("foodrush_user")) || null; }
  catch { return null; }
};

const formatDob = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
};

const NAV_LINKS = [
  { to: "/",           label: "Home"       },
  { to: "/favourites", label: "Favourites" },
  { to: "/grocery",    label: "Grocery"    },
  { to: "/about",      label: "About"      },
  { to: "/contact",    label: "Contact"    },
];

const Header = () => {
  const [cityOpen, setCityOpen]       = useState(false);
  const [userOpen, setUserOpen]       = useState(false);
  const [user, setUser]               = useState(readUser);
  const [selectedCity, setSelectedCity] = useState(getStoredCity);
  const onlineStatus   = useOnlineStatus();
  const location       = useLocation();
  const navigate       = useNavigate();
  const { getItemCount } = useCart();
  const cityRef        = useRef(null);
  const userRef        = useRef(null);

  // Sync user state when navigating back from /signin
  useEffect(() => {
    setUser(readUser());
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("foodrush_user");
    setUser(null);
    setUserOpen(false);
    navigate("/signin");
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem("foodrush_city", JSON.stringify(city));
    window.dispatchEvent(new Event("citychange"));
    setCityOpen(false);
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const cartCount  = getItemCount();
  const firstName  = user?.name?.split(" ")[0] ?? "";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={LOGO_URL} alt="FoodRush" className="h-9 w-9 object-contain rounded-lg" />
          <span className="font-black text-xl tracking-tight">
            <span className="text-orange-500">Food</span>
            <span className="text-gray-800">Rush</span>
          </span>
        </Link>

        {/* City picker */}
        <div className="relative shrink-0" ref={cityRef}>
          <button
            onClick={() => setCityOpen((o) => !o)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {selectedCity.name}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${cityOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {cityOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
              {CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedCity.name === city.name
                      ? "text-orange-500 font-semibold bg-orange-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="hidden md:block flex-1">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to)
                      ? "text-orange-500 bg-orange-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            title={onlineStatus ? "Online" : "Offline"}
            className={`w-2 h-2 rounded-full ${onlineStatus ? "bg-green-500" : "bg-red-500"}`}
          />

          {/* Cart with badge */}
          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            /* ── Signed-in user chip + dropdown ── */
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {firstName[0]?.toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-gray-800">Hi, {firstName}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-gray-400 transition-transform ${userOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-lg py-3 z-50">
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">🎂 {formatDob(user.dob)}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium mt-1"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not signed in ── */
            <Link
              to="/signin"
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
