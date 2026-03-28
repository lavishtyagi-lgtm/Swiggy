<div align="center">

# 🍔 FoodRush

**A personal Swiggy clone — live restaurant data, smart recommendations, cart, and order history.**

Built as a learning project with [Namaste React](https://namastedev.com/learn/namaste-react), evolved into a fully functional personal food delivery research tool.

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6.28-CA4245?style=flat&logo=reactrouter&logoColor=white)
![Parcel](https://img.shields.io/badge/Parcel-2.16-B5E853?style=flat)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat&logo=express&logoColor=white)

</div>

---

## ✨ Features

### Discovery
- 🔴 **Live data** — real restaurants and menus pulled from Swiggy's API via a local proxy
- 🏙️ **City picker** — switch between 8 Indian cities (Pune, Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Ahmedabad)
- 🔍 **Smart search** — filter by restaurant name in real time
- ⭐ **Quick filters** — Top Rated (4.0+), Fast Delivery (≤30 min), Pure Veg
- 💰 **Price filters** — Under ₹200 / ₹200–400 / ₹400–600 / ₹600+
- 🍛 **Dynamic cuisine chips** — generated from live API data, accurate per city

### Intelligence (Phase 4)
- 🕐 **Order Again** — surfaces restaurants you've ordered from before
- ✨ **Recommended for You** — scores restaurants by how well they match your cuisine preferences
- 🎲 **Surprise Me** — picks a random restaurant from the current filtered pool
- 📊 **Preference tracking** — silently learns which cuisines you click most

### Personal
- 👤 **Sign In** — enter your name and date of birth; the app greets you by name
- ❤️ **Favourites** — heart any restaurant; saved to localStorage, accessible from nav
- 🛒 **Cart** — add items, adjust quantities, single-restaurant cart rule (like Swiggy)
- 📦 **Order History** — every "placed" order saved with timestamp, expandable item list

### Menu
- 📋 **Collapsible categories** — scan section names, expand what matters
- 🏆 **Bestseller badge** — highlighted on items Swiggy marks as bestsellers
- 🟢 **Veg / Non-veg indicator** — on every menu item

---

## 🛠️ Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| UI | React 19.2 | Functional components, hooks, Context API |
| Routing | React Router DOM 6.28 | `createBrowserRouter`, `useNavigate`, `useParams` |
| Styling | Tailwind CSS 3.4 | Utility-first, zero custom CSS files |
| Bundler | Parcel 2.16 | Zero-config, fast HMR |
| Proxy | Express 5.2 + node-fetch 3.3 | Bypass Swiggy's CORS headers |
| Persistence | `localStorage` | Cart, favourites, orders, preferences, city, user |

No Redux. No Zustand. No database. Everything is local.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Install
```bash
git clone https://github.com/YOUR_USERNAME/foodrush.git
cd foodrush
npm install
```

### Run (two terminals)

```bash
# Terminal 1 — React app on http://localhost:1234
npm start

# Terminal 2 — Express proxy on http://localhost:3000
npm run server
```

Open **http://localhost:1234** in your browser.

> **Important:** Both processes must run simultaneously. The app fetches live data through the proxy.

### First-time setup tip

Swiggy's API requires an active browser session. If menus fail to load:
1. Open [swiggy.com](https://www.swiggy.com) in the same browser
2. Browse any restaurant
3. Come back and retry — the session cookie is now set

---

## 📁 Project Structure

```
foodrush/
├── index.html              ← Parcel entry point
├── index.css               ← Tailwind directives
├── proxy.js                ← Express CORS proxy (port 3000)
├── tailwind.config.js
└── src/
    ├── App.js              ← Root layout + all route definitions
    ├── components/
    │   ├── Header.js       ← Sticky nav, city picker, cart badge, user greeting
    │   ├── Body.js         ← Restaurant listing, filters, intelligence strips
    │   ├── RestaurantCard.js
    │   ├── RestaurantMenu.js ← Live menu, collapsible categories, ADD button
    │   ├── Cart.js         ← Cart page, bill details, place order
    │   ├── Favourites.js   ← Saved restaurants
    │   ├── OrderHistory.js ← Past orders with timestamps
    │   ├── SignIn.js       ← Name + DOB sign-in page
    │   ├── Shimmer.js      ← Loading skeleton
    │   └── ...
    └── utils/
        ├── constants.js        ← CITIES, URL builders, REST_LOGO_URL
        ├── CartContext.js      ← Cart state (Context API)
        ├── useFavourites.js    ← Favourites CRUD
        ├── usePreferences.js   ← Cuisine preference tracking
        ├── useRestrauntMenu.js ← Menu fetch hook
        └── useOnlineStatus.js  ← Online/offline detection
```

---

## 🗺️ Routes

| Path | Page |
|------|------|
| `/` | Restaurant listing with filters |
| `/restaurants/:resId` | Restaurant menu |
| `/favourites` | Saved favourites |
| `/cart` | Active cart |
| `/history` | Order history |
| `/signin` | Sign in with name + DOB |
| `/grocery` | Instamart (mock data, lazy-loaded) |

---

## 💾 localStorage Keys

All data is stored locally — no backend, no account, no server.

| Key | Contents |
|-----|----------|
| `foodrush_user` | `{ name, dob }` |
| `foodrush_city` | `{ name, lat, lng }` |
| `foodrush_favourites` | Array of full restaurant objects |
| `foodrush_cart` | `{ restaurantId, restaurantName, items[] }` |
| `foodrush_orders` | Array of past orders with timestamps |
| `foodrush_prefs` | Cuisine click counts `{ "Biryani": 4, ... }` |

---

## ⚠️ Known Limitations

- **Swiggy session dependency** — menus require an active Swiggy browser session. If you see an empty response error, visit swiggy.com first.
- **Proxy required** — the app cannot be deployed as a static site. The Express proxy must run locally.
- **Stale favourites** — saved restaurant data (ratings, delivery times) is a snapshot from the time of favouriting and won't auto-update.
- **localStorage only** — clearing browser data resets all preferences, favourites, and history.

---

## 👤 Author

**Lavish Tyagi** — [lavishtyagi2003@gmail.com](mailto:lavishtyagi2003@gmail.com)

---

## 📝 License

MIT
