# Session: Phase 3 — Smart Discovery
Date: 2026-03-29

## Goal
Turn the restaurant listing from a flat, static list into a smart, filterable discovery surface.
Phase 2 made the app personal (favourites, cart, history). Phase 3 makes it *useful for daily decisions*:
give users real filters, dynamic cuisine tags, and context-aware layout so they can find what they want in seconds.

---

## Why Phase 3 Exists

After Phase 2, the app is:
- Fully interactive (cart, favourites, history)
- But the listing page is still dumb — one long scroll, only a name search

Real food delivery apps differentiate on *discovery*, not just listing. The questions a user actually asks:
- "Show me something fast"
- "I want something under ₹300"
- "What about South Indian?"
- "Only pure veg today"

None of these were answerable before Phase 3. The data for all of them was already in the API — the app just wasn't surfacing it.

---

## Architecture Decisions (Locked Before Writing Code)

### Decision 1 — Filter state as an object, not a string
**Before:** `activeFilter` was a single string (one filter at a time)
**After:** `filters: { quick: null, price: null, cuisine: null }` — three independent axes

**Why:** Users want to combine filters. "Top Rated" + "Under ₹400" + "South Indian" should all stack.
A single string can't represent this. An object is flat, simple, and maps cleanly to `useMemo`.

**The alternative:** Separate booleans (`isTopRated`, `priceFilter`, `cuisineFilter`).
Rejected: harder to clear all at once, harder to serialize if we ever persist filter state.

---

### Decision 2 — `applyAllFilters()` as a pure function
All filter logic lives in one pure function outside the component:
```js
const applyAllFilters = (list, filters, search) => { ... }
```
Called only via `useMemo`. No `useState` for filtered results.

**Why:** If filtered results were their own state, every filter change would need a `setFilteredRestaurants()` call.
With `useMemo`, React recomputes automatically when `listofRestaurants`, `filters`, or `searchText` change.
This is the idiomatic React pattern for derived data — no stale state, no sync bugs.

**The alternative:** Keep filtered results in state, update in a `useEffect`.
Rejected: Causes a stale render on mount, adds unnecessary re-renders, is just a manual reimplementation of useMemo.

---

### Decision 3 — Cuisine chips generated from live API data, not hardcoded
`extractTopCuisines(restaurants, limit = 14)` counts occurrences of each cuisine across all restaurants,
sorts by frequency, returns the top 14.

**Why:** Hardcoded cuisine lists go stale and differ by city. If Swiggy shows 50 Biryani restaurants in Hyderabad
but 2 in Chennai, showing "Biryani" as a chip in Chennai is noise. The dynamic list always reflects what's
actually available in the current city.

**The alternative:** Static list of 10 common cuisines.
Rejected: City-switching (Phase 2) makes this immediately wrong for any city other than Pune.

---

### Decision 4 — Filter chips in one scrollable row (not a dropdown)
Quick filters (Top Rated, Fast Delivery, Pure Veg) and price filters are all rendered as `<FilterChip>` buttons
in a horizontal overflow-x-auto strip.

**Why:** Mobile-first. A dropdown adds a tap to open + a tap to select. Chips are one tap.
Visible chips also communicate *what's filterable* — users discover options by seeing them.

---

### Decision 5 — `parseCost()` normalises price strings
Swiggy returns costForTwo as a string: `"₹300 for two"`, `"₹200"`, `"300"`.
`parseCost()` strips all non-digits, parses as int, returns 0 on failure.
Price filter functions call this — they never access raw strings directly.

**Why:** Direct string comparison or `parseInt` on the raw value fails silently.
A dedicated parser keeps all the messiness in one place.

---

## What Was Built

### New file: `src/utils/usePreferences.js`
- Tracks how many times each cuisine has been clicked across sessions
- `trackCuisines(cuisines[])` — increments count for each cuisine
- `getTopPreferred(n)` — returns top N cuisines by click count
- Storage key: `foodrush_prefs` (`{ "Biryani": 4, "Pizza": 2, ... }`)
- Called on every restaurant card click in Body.js

### Modified: `src/components/Body.js`
Complete rewrite. Key changes:

| Before | After |
|--------|-------|
| Single `activeFilter` string | `filters: { quick, price, cuisine }` object |
| Filter logic inline in render | `applyAllFilters()` pure function |
| Filtered list as state | `filteredRestaurants` via `useMemo` |
| Hardcoded filter buttons | `QUICK_FILTERS` + `PRICE_FILTERS` arrays (declarative) |
| No cuisine filter | Dynamic `topCuisines` from API, cuisine chip row |
| No cost parsing | `parseCost()` helper for safe price filtering |
| 3 filter buttons | Full filter bar: 3 quick + 4 price + 14 cuisine chips |

---

## Tasks

- [x] **Task 1** — `usePreferences.js`: New hook. `trackCuisines()` + `getTopPreferred()`.
  Storage key `foodrush_prefs`. Pure localStorage, no React state needed.

- [x] **Task 2** — `Body.js`: Rewrite with:
  - `QUICK_FILTERS` + `PRICE_FILTERS` declarative arrays
  - `parseCost()` helper
  - `applyAllFilters()` pure function
  - `filters` object state + `toggleFilter(type, id)` handler
  - `filteredRestaurants`, `topCuisines` via `useMemo`
  - `FilterChip` sub-component
  - Cuisine chip row from `extractTopCuisines()`
  - `trackCuisines` called on every Link click

- [x] **Task 3** — `RestaurantMenu.js`: Bestseller badge on MenuItem.
  Checks `info.ribbon?.text` (contains "bestseller") or `info.isBestSeller`.
  Renders amber badge next to VegIndicator when true.

---

## Problems Faced

### Problem — Combining multiple filter types cleanly
**The challenge:** Phase 2 used a single `activeFilter` string. Adding price + cuisine filters
means 3 independent filter axes. They need to stack (AND logic), not replace each other.

**What we did:** Refactored to `filters` object `{ quick, price, cuisine }`.
`toggleFilter(type, id)` sets `filters[type]` to `id` if not already set, or `null` if toggling off.
`applyAllFilters` applies each axis sequentially — the output of one filter is the input of the next.

**Why AND logic?** Swiggy uses AND. If you select "Top Rated" + "Fast Delivery", you want restaurants
that are both — not all top-rated PLUS all fast-delivery.

---

### Problem — Cuisine chips from live data vs hardcoded
**The challenge:** Different cities have completely different cuisine distributions.
**What we did:** `extractTopCuisines()` reads the current restaurant list, counts cuisines, returns top 14.
This runs inside `useMemo` so it recomputes when the restaurant list changes (city switch triggers this).

---

## What Phase 3 Unlocks

All the groundwork is now laid for Phase 4:
- `foodrush_prefs` is being written every time a user clicks a restaurant
- `getRecentOrderedIds()` can cross-reference `foodrush_orders` (Phase 2) with live restaurants
- The filter bar is complete — Phase 4 only adds *personalised sections* above the main grid, not new filters
