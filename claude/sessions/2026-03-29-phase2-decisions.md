# Phase 2 — Decisions, Problems & Alternatives
Date: 2026-03-29
Author: Claude (for LAVISH TYAGI)

---

## What Was Completed

| Task | Feature | Status |
|------|---------|--------|
| 1 | constants.js — CITIES + URL builder functions | ✅ Done |
| 2 | useRestrauntMenu.js — dynamic city coordinates | ✅ Done |
| 3 | Header.js — city picker dropdown | ✅ Done |
| 4 | Body.js — re-fetch on city change via window event | ✅ Done |
| 5 | useFavourites.js — custom hook with localStorage | ✅ Done |
| 6 | RestaurantCard.js — heart icon with toggle | ✅ Done |
| 7 | Body.js — favourites props passed to cards | ✅ Done |
| 8 | Favourites.js — new page + route + nav link | ✅ Done |
| 9 | CartContext.js — Context + Provider + useCart hook | ✅ Done |
| 10 | App.js — CartProvider wraps RouterProvider | ✅ Done |
| 11 | RestaurantMenu.js — ADD button + qty controls | ✅ Done |
| 12 | Header.js — cart badge with item count | ✅ Done |
| 13 | Cart.js — full cart page with bill details | ✅ Done |
| 14 | OrderHistory.js — history page + Place Order saves | ✅ Done |

**All 14 tasks completed.**

New files created: `useFavourites.js`, `CartContext.js`, `Cart.js`, `Favourites.js`, `OrderHistory.js`
Files modified: `constants.js`, `useRestrauntMenu.js`, `Header.js`, `Body.js`, `RestaurantCard.js`, `RestaurantMenu.js`, `App.js`

---

## Problems Faced & Why

### Problem 1 — City picker needs to talk to Body without props
**The challenge:** Header.js owns the city selector. Body.js owns the restaurant fetch.
They are siblings in the route tree — neither is a parent of the other. Passing city state
from Header → Body would require lifting it to App.js, which means route elements need props,
which react-router-dom v6 doesn't support cleanly on route definitions.

**What we did:** Used `window.dispatchEvent(new Event("citychange"))` from Header and
`window.addEventListener("citychange", fetchData)` in Body. Clean, zero dependencies,
no extra state management.

**Is there a better way?** Yes — a CityContext would be cleaner for a larger app.
But for this project size, a custom window event is pragmatic. It works, it's readable,
and it avoids adding another Context for one piece of state.

---

### Problem 2 — CartProvider must wrap RouterProvider, not be inside it
**The challenge:** `useCart()` is called inside `Header.js`, which is rendered by the router.
If CartProvider is inside the router tree, Header can't consume it because it's rendered
by `<Outlet />` which is a child of the router — and the router renders before CartProvider.

**What we did:** Wrapped `<RouterProvider>` with `<CartProvider>` in `App.js`:
```jsx
<CartProvider>
  <RouterProvider router={route} />
</CartProvider>
```
This ensures CartContext is available to every component the router renders.

**Is there a better way?** This IS the correct way. React Context must be an ancestor
of all consumers. Since the router is the root of our component tree, the provider
must be outside it.

---

### Problem 3 — Single restaurant cart rule needs a confirm dialog
**The challenge:** If a user has items from "Pizza Hut" and taps ADD on a "McDonald's" item,
we need to handle the conflict. Options were:
a) Silent replace — bad, user loses their cart without knowing
b) Prevent adding — bad, confusing, no way to switch
c) Confirm dialog — shows what's happening, user chooses

**What we did:** `window.confirm()` — native browser dialog. Simple, zero dependencies.
The text clearly shows which restaurant is being cleared.

**Is there a better way?** A custom modal component would be more polished.
`window.confirm()` blocks the main thread and looks different across browsers.
When Phase 3 comes, replace it with a proper modal. For now it works correctly.

---

### Problem 4 — Favourites page has no live data without refetching
**The challenge:** The Favourites page shows saved restaurants. But the restaurant images,
ratings, and delivery times on Swiggy change. If we only store the restaurant ID,
we'd need to fetch the full restaurant list again just to render the Favourites page.

**What we did:** Store the full restaurant object in localStorage when favouriting.
This means Favourites loads instantly, works offline, and needs no API call.
The tradeoff: stored data goes stale (ratings may be slightly outdated).

**Is there a better way?** For a real app — yes. Store only IDs, and when the Favourites
page loads, fetch fresh data for those IDs. But Swiggy's API doesn't support
"get restaurant by ID" (only by location). So stale data is acceptable here.

---

### Problem 5 — Order history is localStorage-only (no timestamps formatting edge cases)
**What we did:** `Date.now()` for order ID, `new Date().toISOString()` for timestamp,
formatted with `toLocaleDateString("en-IN", ...)` for Indian locale display.

**Potential issue:** If localStorage is full (rare but possible on mobile),
the `saveOrder` function silently fails. The order is "placed" (cart cleared)
but not saved to history.

**Is there a better way?** Catch the quota error and warn the user:
"History is full — clear some past orders to save new ones."
Not implemented now to keep scope tight. Easy to add later.

---

## Architectural Decisions — Were They Right?

### Decision: React Context for Cart, not Zustand
**Why Context:** CLAUDE.md explicitly says "No Redux, Zustand unless a session decides."
Cart is the first feature that genuinely needs shared state (Header badge + Menu ADD button
+ Cart page all need the same data). Context is the right tool here.

**Would Zustand be better?** For this app size — marginally. Zustand's syntax is cleaner
and it handles localStorage persistence more elegantly. But adding a new dependency for
one Context is overkill. Context is sufficient and zero-dependency.

---

### Decision: `localStorage` for all persistence (no backend)
**Why:** This is a personal tool. No auth, no user accounts, no server to maintain.
localStorage is synchronous, always available, and survives page refresh.

**The limit:** ~5MB per domain. An order history of 1000 orders with images would
approach this. In practice, a personal user will never hit this limit.

**Would IndexedDB be better?** For large amounts of structured data, yes.
But localStorage is simpler and sufficient for the usage pattern here.

---

### Decision: Window custom event for city change (not CityContext)
**Why:** Adding a third Context (CityContext) for one piece of state that only
two components care about is over-engineering. The window event pattern is
a lightweight pub/sub that's perfectly readable.

**The tradeoff:** If we add a third component that needs to react to city changes,
we'd add a third event listener. At that point, CityContext becomes the right move.

---

### Decision: `window.confirm()` for cart conflict (not a custom modal)
**Why:** Fastest correct implementation. The confirm dialog is native, accessible,
and works across all browsers without any dependencies.

**The tradeoff:** Looks different on every OS, can't be styled, blocks the thread.
Replace with a custom modal if this feels jarring in use.

---

## What This Unlocks for Phase 3

With Phase 2 done, Phase 3 (Intelligence Layer) can now do:
- "Suggested for you" — based on which cuisines you favourite most
- "Order again" — already in OrderHistory.js (link back to restaurant)
- Price filter — data already in the API, just needs a UI slider
- Cuisine preference tracking — can now read favourites + order history to infer taste

The data foundation (localStorage with structured keys) is ready.
Phase 3 is mostly UI additions on top of existing data.

---

## localStorage Keys Reference

| Key | What | Format |
|-----|------|--------|
| `foodrush_city` | Selected city | `{ name, lat, lng }` |
| `foodrush_favourites` | Saved restaurants | `Array<RestaurantObject>` |
| `foodrush_cart` | Active cart | `{ restaurantId, restaurantName, items[] }` |
| `foodrush_orders` | Past orders | `Array<{ id, placedAt, restaurantName, items[], total }>` |
