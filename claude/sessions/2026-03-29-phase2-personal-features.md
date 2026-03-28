# Session: Phase 2 — Personal Features
Date: 2026-03-29

## Goal
Transform FoodRush from a read-only restaurant browser into a tool LAVISH TYAGI actually uses daily.
Four features: City Picker, Favourites, Cart, Order History. Each one is independently useful.
Order matters — City Picker is foundational, Favourites is independent, Cart unlocks Order History.

---

## Senior Dev Thinking: Why These Features, In This Order

### The problem right now
The app shows restaurants and menus. That's it. You can't:
- See restaurants in any city other than Pune
- Save a restaurant you like
- Add items to a cart
- Track what you've ordered before

It's a window — not a tool.

### What each feature unlocks

**City Picker** — Makes the app usable anywhere in India. Without this,
the app is only useful if you're in Pune. Everything else we build
becomes more valuable once it works for any city.

**Favourites** — The simplest "memory" feature. Mark restaurants you
like once, find them instantly without searching. Personal apps live and
die on this kind of personalisation. No backend needed — localStorage is enough.

**Cart** — The most complex feature but the most impactful. Turns the
menu page from read-only to interactive. Once you can add items, the
whole app feels real. Key decision: single-restaurant cart only (Swiggy's
model) — you can't order from two places at once.

**Order History** — The payoff for having a cart. Every time you
"place" a simulated order, it's timestamped and saved locally. After a
month you have a real personal record of what you considered ordering.
Genuinely useful for meal planning.

---

## Architecture Decisions (Locked Before Writing Code)

### City Picker
- City state lives in **Header.js** (that's where the UI is, like Swiggy/Zomato)
- Persisted in `localStorage` as `foodrush_city`
- Body.js re-fetches when city changes via a **custom window event** (`citychange`)
  - No context needed, no prop drilling, clean separation
- `constants.js` gets: `CITIES` array + URL builder functions (replaces static `FETCH_URL`/`MENU_URL`)

### Favourites
- State managed by a **custom hook** `useFavourites.js` in `src/utils/`
- Stores full restaurant info in localStorage (not just IDs) — works without refetching
- localStorage key: `foodrush_favourites`
- RestaurantCard receives `isFavourite` + `onToggle` as props (keeps card "dumb")
- Favourites page reads localStorage directly — no API call needed

### Cart
- **React Context** (`CartContext.js`) — the first legitimate use of Context in this project
- Cart Context wraps the entire App in `App.js`
- `useCart()` hook for consuming in any component
- Cart structure:
  ```js
  {
    restaurantId: "xxx",
    restaurantName: "Pizza Hut",
    items: [{ id, name, price, quantity, isVeg, imageId }]
  }
  ```
- **Single restaurant rule**: if user adds from a different restaurant →
  confirm dialog "Clear cart from [Old Restaurant] and start fresh?"
- localStorage key: `foodrush_cart`
- Synced to localStorage on every cart change (useEffect in CartContext)

### Order History
- Saved to localStorage key: `foodrush_orders`
- Each order: `{ id, placedAt, restaurantName, items, total }`
- "Place Order" button lives in Cart.js
- On place: saves snapshot to history, clears cart, navigates to /history

---

## New Files

| File | What |
|------|------|
| `src/utils/CartContext.js` | Context + Provider + useCart hook |
| `src/utils/useFavourites.js` | Custom hook for favourites CRUD |
| `src/components/Cart.js` | Cart page |
| `src/components/Favourites.js` | Favourites page |
| `src/components/OrderHistory.js` | Order history page |

## Files Modified

| File | Why |
|------|-----|
| `src/utils/constants.js` | CITIES list + URL builder functions |
| `src/utils/useRestrauntMenu.js` | Use getMenuUrl() + getStoredCity() |
| `src/App.js` | CartProvider wrap + 3 new routes |
| `src/components/Header.js` | City picker UI + cart badge + favourites link |
| `src/components/Body.js` | Dynamic city URL + citychange listener + favourites props |
| `src/components/RestaurantCard.js` | Heart icon for favourites |
| `src/components/RestaurantMenu.js` | ADD button on menu items |

---

## Tasks (14 total, in strict order)

### Feature 1 — City Picker (4 tasks)

- [x] **Task 1** — `constants.js`: Add `CITIES` array (8 Indian cities with lat/lng),
  replace static `FETCH_URL`/`MENU_URL` with `getRestaurantsUrl(lat, lng)` and
  `getMenuUrl(lat, lng, resId)` functions. Add `getStoredCity()` helper that reads
  localStorage and falls back to Pune.

- [x] **Task 2** — `useRestrauntMenu.js`: Replace static `MENU_URL + resId` with
  `getMenuUrl(city.lat, city.lng, resId)` using `getStoredCity()`.

- [x] **Task 3** — `Header.js`: Add city selector — shows current city name with a
  down-arrow. Click opens dropdown of 8 cities. Selecting one saves to localStorage
  and dispatches `window.dispatchEvent(new Event("citychange"))`.

- [x] **Task 4** — `Body.js`: Replace static `FETCH_URL` with
  `getRestaurantsUrl(city.lat, city.lng)` where city is read fresh on each fetch.
  Add `window.addEventListener("citychange", fetchData)` in useEffect.

---

### Feature 2 — Favourites (4 tasks)

- [x] **Task 5** — `src/utils/useFavourites.js`: New custom hook.
  Reads `foodrush_favourites` from localStorage (array of restaurant objects).
  Returns `{ favourites, toggleFavourite, isFavourite }`.
  Writes to localStorage on every change.

- [x] **Task 6** — `RestaurantCard.js`: Add heart icon button (top-right of image).
  Receives `isFavourite` (bool) and `onToggle` (fn) as props.
  Filled red heart if favourite, outline if not. Stops Link navigation on click.

- [x] **Task 7** — `Body.js`: Use `useFavourites()` hook. Pass `isFavourite` and
  `onToggle` to each `RestaurantCard`. Also show on Favourites page.

- [x] **Task 8** — `Favourites.js` + `App.js` + `Header.js`:
  New page at `/favourites` — reads from hook, renders same RestaurantCard grid.
  Empty state: "No favourites yet — heart a restaurant to save it here."
  Add "Favourites" link to Header nav. Add route in App.js.

---

### Feature 3 — Cart (5 tasks)

- [x] **Task 9** — `src/utils/CartContext.js`: Create CartContext + CartProvider.
  State: `{ restaurantId, restaurantName, items: [] }`.
  Functions: `addItem(restaurantId, restaurantName, itemInfo)`,
  `removeItem(itemId)`, `updateQuantity(itemId, delta)`, `clearCart()`,
  `getTotal()`, `getItemCount()`.
  On mount: load from `foodrush_cart` in localStorage.
  On every change: sync to localStorage.
  Export `useCart` hook.

- [x] **Task 10** — `App.js`: Import CartProvider, wrap root element.
  ```jsx
  <CartProvider>
    <RouterProvider router={route} />
  </CartProvider>
  ```

- [x] **Task 11** — `RestaurantMenu.js` → `MenuItem`: Add ADD/quantity control.
  If item not in cart → show "+ ADD" button.
  If item in cart → show [ − | count | + ] inline control.
  If adding from a different restaurant than what's already in cart →
  confirm: "Clear cart from [X] and add from [Y]?"
  Uses `useCart()`.

- [x] **Task 12** — `Header.js`: Import `useCart`. Show cart badge on the Cart link —
  small orange circle with item count. Hide badge when count is 0.

- [x] **Task 13** — `Cart.js` + route in `App.js`:
  If cart is empty: friendly empty state with link to browse.
  If not empty: restaurant name header, item list (image, name, qty controls, item total),
  order total, delivery estimate row, "Place Order" button.
  Qty controls use `updateQuantity`. Remove button uses `removeItem`.

---

### Feature 4 — Order History (1 task)

- [x] **Task 14** — `Cart.js` "Place Order" + `OrderHistory.js` + route:
  "Place Order" saves `{ id: Date.now(), placedAt, restaurantName, items, total }`
  to `foodrush_orders` in localStorage, clears cart, navigates to `/history`.
  `OrderHistory.js` reads and renders orders grouped by date.
  Each order card: restaurant, time, total, expandable item list.
  "Clear History" button at the top.
  Add `/history` route in App.js, link in Header.

---

## What the User Experiences After Phase 2

**Day 1:** Opens app in Delhi — switches city in header — sees Delhi restaurants.

**Browsing:** Sees a restaurant they like — taps heart — it turns red. Next visit, goes to
Favourites tab — it's there without searching.

**Ordering:** Opens a restaurant — sees a menu — taps "+ ADD" on items — badge appears
in header showing "3". Opens cart — sees itemised total — taps "Place Order" — cart clears.

**Memory:** Opens History tab next week — sees 5 past carts with timestamps — can
re-browse the same restaurant from the history entry.

---

## Notes

- No backend. Everything in localStorage. This is intentional for a personal tool.
- Cart is not a real order — "Place Order" is simulated. This is clearly communicated in the UI.
- City picker covers 8 cities: Pune, Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Ahmedabad.
- All localStorage keys are prefixed `foodrush_` to avoid collisions.
- useFavourites and useCart are both designed so they could be swapped to a real backend later.
