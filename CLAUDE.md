# Swiggy Clone — Claude Guidelines

This file is the source of truth for how Claude should behave in this project.
Read this before writing or modifying any code. Do not hallucinate patterns — check existing files first.

---

## Project Overview

A personal-use Swiggy food delivery clone. Pulls **real live data** from Swiggy's API via a local Express proxy (to bypass CORS). Built originally as a "Namaste React" learning project, now a genuine personal tool.

- **Author:** LAVISH TYAGI (lavishtyagi2003@gmail.com)
- **Purpose:** Personal food delivery research / browsing tool
- **Phase:** Phase 5 in progress — Sign In, Surprise Me, personalised hero greeting added

### Tech Stack

| Layer | Tool |
|-------|------|
| UI Framework | React 19.2.0 |
| Routing | `react-router-dom` v6.28.0 |
| Styling | Tailwind CSS 3.4.19 |
| Bundler | Parcel 2.16.1 |
| CSS Processing | PostCSS + Autoprefixer |
| Proxy Server | Express 5.2.1 + node-fetch 3.3.2 |
| Runtime | Node.js (ESM — `"type": "module"` in package.json) |

> **Router note:** `react-router` v7 was removed (vulnerability). Use only `react-router-dom` v6 APIs:
> `createBrowserRouter`, `RouterProvider`, `Outlet`, `Link`, `useParams`, `useNavigate`, `useLocation`.

---

## Project Structure

```
Swiggy/
├── CLAUDE.md                         ← you are here
├── index.html                        ← Parcel entry point
├── index.css                         ← Tailwind directives
├── tailwind.config.js
├── .postcssrc.json
├── package.json
├── proxy.js                          ← Express proxy (port 3000)
├── claude/
│   ├── ANALYSIS.md                   ← architecture analysis + vision
│   └── sessions/
│       ├── 2026-03-29-vulnerability-fixes-and-feature-plan.md
│       ├── 2026-03-29-phase2-personal-features.md
│       ├── 2026-03-29-phase2-decisions.md
│       ├── 2026-03-29-phase3-smart-discovery.md
│       └── 2026-03-29-phase4-intelligence.md
└── src/
    ├── App.js                        ← Root + all routes
    ├── components/
    │   ├── Header.js                 ← Nav, city picker, cart badge, user greeting chip + dropdown
    │   ├── Body.js                   ← Restaurant listing, filters, intelligence strips, Surprise Me
    │   ├── RestaurantCard.js         ← Card UI, heart toggle, rating badge
    │   ├── RestaurantMenu.js         ← Menu page, collapsible categories, ADD button, bestseller badge
    │   ├── Cart.js                   ← Cart page, bill details, place order
    │   ├── Favourites.js             ← Favourites page (from localStorage)
    │   ├── OrderHistory.js           ← Order history page
    │   ├── SignIn.js                 ← Sign-in page (name + DOB → foodrush_user)
    │   ├── Shimmer.js                ← Loading skeleton (animate-pulse)
    │   ├── Error.js                  ← Route error boundary
    │   ├── Grocery.js                ← Lazy-loaded Instamart page (mock data)
    │   ├── About.js                  ← Static about page
    │   └── Contact.js                ← Static contact page
    └── utils/
        ├── constants.js              ← CITIES, getRestaurantsUrl, getMenuUrl, getStoredCity, REST_LOGO_URL
        ├── mockData.js               ← Static mock data for Grocery
        ├── useOnlineStatus.js        ← Custom hook: online/offline detection
        ├── useRestrauntMenu.js       ← Custom hook: fetch menu (note: typo — do NOT rename)
        ├── useFavourites.js          ← Custom hook: favourites CRUD via localStorage
        ├── usePreferences.js         ← Custom hook: cuisine preference tracking
        └── CartContext.js            ← Cart Context + CartProvider + useCart hook
```

---

## Running Locally

Two processes must run simultaneously:

```bash
# Terminal 1 — Parcel dev server (app on localhost:1234)
npm start

# Terminal 2 — Express proxy (on localhost:3000)
npm run server
```

The React app fetches from `localhost:3000`. The proxy adds the required `User-Agent` and other headers to forward to Swiggy's real API.

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `Body` | Restaurant listing with filters |
| `/restaurants/:resId` | `RestaurantMenu` | Live menu from Swiggy API |
| `/favourites` | `Favourites` | Reads `foodrush_favourites` from localStorage |
| `/cart` | `Cart` | Active cart, place order |
| `/history` | `OrderHistory` | Past orders from `foodrush_orders` |
| `/signin` | `SignIn` | Name + DOB form → saves to `foodrush_user` |
| `/about` | `About` | Static page |
| `/contact` | `Contact` | Static page |
| `/grocery` | `Grocery` | Lazy-loaded, mock data |

---

## API & Data Layer

### Proxy Server (`proxy.js`)

- Port: **3000**
- `GET /api/restaurants?lat=&lng=` → Swiggy restaurant list
- `GET /api/menu?lat=&lng=&restaurantId=` → Swiggy menu (reads as text first to handle empty body)
- Adds: `User-Agent`, `Referer`, `Origin` headers
- Menu URL requires `submitAction=ENTER` query param

### Constants (`src/utils/constants.js`)

All URLs and city data live here. Never hardcode URLs in components.

```js
CITIES                   // Array of 8 Indian cities with name/lat/lng
getStoredCity()          // Reads foodrush_city from localStorage, falls back to Pune
getRestaurantsUrl(lat, lng)   // Returns proxy URL for restaurant list
getMenuUrl(lat, lng, resId)   // Returns proxy URL for restaurant menu
REST_LOGO_URL            // Swiggy CDN base for restaurant/menu images
```

### Swiggy API Response Shapes

**Restaurant list:**
```js
json?.data?.cards[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants
// Array of { info: { id, name, cuisines, avgRating, costForTwo, sla, cloudinaryImageId, veg, ribbon } }
```

**Menu:**
```js
// Restaurant info: cards[0].card.card.info
// Categories: cards.find(c => c.groupedCard).groupedCard.cardGroupMap.REGULAR.cards
// Filter categories: regularCards.filter(c => c.card?.card?.itemCards?.length > 0)
// Item info: itemCard.card.info (id, name, price, defaultPrice, isVeg, imageId, description, ribbon, isBestSeller)
```

> **Warning:** Swiggy changes their API response structure. If data comes back undefined,
> try `cards[0]`, `cards[2]`, etc. Fix extraction only in the dedicated helper functions — never inline.

---

## localStorage Keys

| Key | What | Format |
|-----|------|--------|
| `foodrush_city` | Selected city | `{ name, lat, lng }` |
| `foodrush_favourites` | Saved restaurants (full objects) | `Array<RestaurantObject>` |
| `foodrush_cart` | Active cart | `{ restaurantId, restaurantName, items[] }` |
| `foodrush_orders` | Past orders | `Array<{ id, placedAt, restaurantName, items[], total }>` |
| `foodrush_prefs` | Cuisine click counts | `{ "Biryani": 4, "Pizza": 2, ... }` |
| `foodrush_user` | Signed-in user | `{ name: string, dob: string (YYYY-MM-DD) }` |

---

## Component Conventions

**Functional components only** — no class components.

**State:**
- Local UI state: `useState`
- Derived data: `useMemo` (never `useState` for something computable from other state)
- Cart (shared across Header + Menu + Cart page): `CartContext` via `useCart()`
- No Redux, no Zustand

**Data fetching:** `useEffect` + `fetch` inside a named async function:
```js
useEffect(() => { fetchData(); }, []);
const fetchData = async () => { ... };
```

**Custom hooks:** Live in `src/utils/`. Named `useXxx`. Return only what callers need.

**Routing:** All routes defined in `src/App.js` only.

**Styling:** Tailwind utility classes only. No separate CSS files per component. No inline `style={{}}`.

**Exports:**
```js
// Default exports (no braces): Body, Header, RestaurantCard, Shimmer
// Named exports (with braces): RestaurantMenu, Contact, About, Cart, Favourites, OrderHistory
// Named exports from utils: useCart, useFavourites, usePreferences, useOnlineStatus, useRestrauntMenu
// Named exports from CartContext: CartProvider, useCart
```

---

## What's Built (Phase 4 Complete)

| Feature | Status | Where |
|---------|--------|-------|
| Restaurant listing with live data | ✅ | `Body.js` |
| Search by name | ✅ | `Body.js` |
| Quick filters (Top Rated, Fast Delivery, Pure Veg) | ✅ | `Body.js` |
| Price range filters (4 tiers) | ✅ | `Body.js` |
| Dynamic cuisine chips from API | ✅ | `Body.js` |
| Stacked AND filter logic | ✅ | `Body.js` → `applyAllFilters()` |
| "Order Again" personalised strip | ✅ | `Body.js` |
| "Recommended for You" strip | ✅ | `Body.js` |
| "Surprise Me" random pick | ✅ | `Body.js` |
| Cuisine preference tracking | ✅ | `usePreferences.js` |
| Sign In (name + DOB) | ✅ | `SignIn.js` |
| Personalised hero greeting | ✅ | `Body.js` |
| User chip + DOB dropdown in header | ✅ | `Header.js` |
| City picker (8 Indian cities) | ✅ | `Header.js` |
| City change re-fetches restaurants | ✅ | `Body.js` ← `citychange` window event |
| Favourites with heart toggle | ✅ | `RestaurantCard.js` + `useFavourites.js` |
| Favourites page | ✅ | `Favourites.js` |
| Restaurant menu (collapsible) | ✅ | `RestaurantMenu.js` |
| Menu bestseller badge | ✅ | `RestaurantMenu.js` → `MenuItem` |
| Cart (ADD / qty controls) | ✅ | `RestaurantMenu.js` + `CartContext.js` |
| Cart page with bill details | ✅ | `Cart.js` |
| Single-restaurant cart rule | ✅ | `CartContext.js` + `RestaurantMenu.js` |
| Order history | ✅ | `OrderHistory.js` |
| Cart badge in header | ✅ | `Header.js` |
| Shimmer loading skeleton | ✅ | `Shimmer.js` |
| Online/offline detection | ✅ | `useOnlineStatus.js` |
| Error states (proxy down, API changed) | ✅ | `Body.js`, `RestaurantMenu.js` |
| Lazy-loaded Grocery page | ✅ | `Grocery.js` (mock data) |

---

## Known Issues / Technical Debt

1. **`useRestrauntMenu` typo** — filename is `useRestrauntMenu.js` (missing 'a'). Do NOT rename without updating every import.

2. **`window.confirm()` for cart conflict** — native browser dialog, blocks thread, can't be styled. Replace with a custom modal component in a future session if it feels jarring.

3. **`window.confirm()` for clear history** — same issue as above.

4. **Cuisine preferences never decay** — click counts accumulate forever. A user whose tastes change will see outdated recommendations. Future fix: weight recent clicks more heavily.

5. **Favourites data goes stale** — full restaurant objects stored at time of favouriting. Ratings/delivery times won't update. Acceptable because Swiggy has no "get restaurant by ID" endpoint.

6. **localStorage quota** — if storage is full, order save silently fails (cart is cleared but order not saved). Future fix: catch QuotaExceededError and warn the user.

---

## Planning Rules (Follow Every Session)

### Before writing any code
1. Read this CLAUDE.md.
2. Read the relevant component/utility files — never assume their current state.
3. Check `claude/ANALYSIS.md` and the latest session doc for context.
4. Identify which existing pattern to follow before inventing something new.

### Proposing changes
- Default mode: **plan first, implement second**.
- Describe what will change and which files will be touched before touching anything.
- Each implementation step should touch as few files as possible.

### Session file
For any non-trivial feature, create a session doc at:
```
claude/sessions/<YYYY-MM-DD>-<short-slug>.md
```

---

## What NOT to Do

- Do not use Redux, Zustand unless a session explicitly decides to add it.
- Do not create new Context unless Cart-level shared state is needed.
- Do not create new utility files without checking if the logic belongs in an existing one.
- Do not rename `useRestrauntMenu.js` without explicit instruction.
- Do not use `react-router` v7 APIs — v6 only.
- Do not hardcode API URLs inside components — always use `constants.js`.
- Do not use inline `style={{}}` in JSX — use Tailwind classes.
- Do not add `console.log` to new code.
- Do not create CSS files per component.

---

## Phased Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Complete | Security fixes: Router conflict, XSS in Grocery, proxy empty body |
| Phase 1 | ✅ Complete | Foundation: Menu endpoint, RestaurantMenu implementation, Shimmer fix |
| Phase 2 | ✅ Complete | Personal features: City picker, Favourites, Cart, Order History |
| Phase 3 | ✅ Complete | Smart Discovery: Filter bar, price/cuisine/quick filters, dynamic cuisine chips |
| Phase 4 | ✅ Complete | Intelligence: Cuisine preference tracking, "Order Again", "Recommended for You" |
| Phase 5 | 🔄 In Progress | Sign In (name + DOB), "Surprise Me" button, personalised hero greeting |
| Phase 6 | 🔜 Future | Ideas: time-aware suggestions, preference breakdown page, shared wishlists |

---

*Last updated: 2026-03-29 — Phase 5 in progress (Sign In, Surprise Me, personalised greeting)*
