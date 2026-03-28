# Session: Phase 4 — Intelligence Layer
Date: 2026-03-29

## Goal
Use the data the app has been silently accumulating (order history, cuisine click counts) to show users
restaurants they'll actually want — before they search for them.

Phase 4 is not new infrastructure. It's the payoff for Phase 2 (order history + localStorage foundation)
and Phase 3 (cuisine preference tracking). Every feature here reads data that already exists.

---

## Why Phase 4 Exists

After Phase 3, the app has excellent *reactive* discovery (filter by what you know you want).
Phase 4 adds *proactive* discovery (show you what you'll probably want based on history).

A returning user should see:
1. **"Order Again"** — restaurants they've ordered from before, surfaced instantly
2. **"Recommended for You"** — restaurants whose cuisines match what they click most

This is what Swiggy/Zomato call "personalisation". We have all the raw data to do it locally —
no ML, no backend, no user account needed.

---

## Architecture Decisions (Locked Before Writing Code)

### Decision 1 — Intelligence strips only show when browsing (not when filtering/searching)
`browsing = !isFiltering(filters, searchText)`

When a user is actively filtering ("show me veg food under ₹300"), they have a specific intent.
Injecting "Recommended for You" above their results is noise — it fights their intent.
Intelligence strips are for open-ended sessions, not targeted searches.

**The alternative:** Always show strips.
Rejected: They push the main restaurant grid down the page when the user doesn't want them.
An actively filtering user already knows what they want — personalization is irrelevant.

---

### Decision 2 — `HorizontalStrip` sub-component (horizontal scroll, not another grid)
```jsx
const HorizontalStrip = ({ title, restaurants, isFavourite, onToggleFavourite, onCardClick }) => (
  <div className="mb-8">
    <h2>...</h2>
    <div className="flex gap-3 overflow-x-auto pb-2">
      {restaurants.map(...)}
    </div>
  </div>
);
```
Returns `null` if `restaurants.length === 0` — strips only appear when they have data.

**Why horizontal?** The main grid below is already vertical. A horizontal strip creates visual hierarchy
without duplicating the grid pattern. It's how Swiggy, Spotify, Netflix all surface curated rows.
It also limits cognitive load — only 6–8 cards visible, not the full list.

---

### Decision 3 — Recommendations via cuisine overlap score, not ML
```js
const recommendations = listofRestaurants
  .map((r) => ({ r, score: r.info.cuisines?.filter((c) => preferred.includes(c)).length || 0 }))
  .filter(({ score }) => score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 8)
  .map(({ r }) => r);
```

Score = number of matching cuisines between the restaurant and the user's top 5 preferred cuisines.
A restaurant offering 3 of your top cuisines scores higher than one offering 1.

**Why not ML?** The dataset (one user's click history, 50-200 restaurants) is far too small for ML.
A simple overlap score is accurate enough, transparent (you can reason about why it recommended something),
and has zero latency (pure JS computation).

**The alternative:** Sort by order history frequency.
Problem: A user might order from the same restaurant repeatedly not because they love it, but because
it's fast/cheap. Cuisine preference is a better signal for discovery.

---

### Decision 4 — "Order Again" reads `foodrush_orders`, cross-references live restaurants
```js
const getRecentOrderedIds = () => {
  const orders = JSON.parse(localStorage.getItem("foodrush_orders") || "[]");
  const seen = new Set();
  return orders
    .filter((o) => { if (seen.has(o.restaurantId)) return false; seen.add(o.restaurantId); return true; })
    .slice(0, 6)
    .map((o) => o.restaurantId);
};
```

IDs are then cross-referenced with live `listofRestaurants`. Only restaurants that exist in the current
city's live data appear. This means:
- If you ordered from a Delhi restaurant while in Delhi, it won't appear in the Pune strip
- The card shows live data (current rating, delivery time) not the stale snapshot from the order

**The alternative:** Store full restaurant objects in order history (like favourites).
Rejected: Order history already stores enough data for the history page. Duplicating the full restaurant
object would double the storage and show stale information in the strip.

---

### Decision 5 — Both strips use the same `RestaurantCard` and `Link` as the main grid
No new card component. The strip just uses `w-44 shrink-0` on the Link wrapper to constrain width
while allowing the card to retain all its existing behaviour (heart toggle, image, rating badge, etc.).

**Why:** Consistency. Users understand the card. Changing the card format in strips would require them
to learn a new UI pattern for no benefit.

---

## What Was Built

### Modified: `src/components/Body.js`

New additions to Phase 3 Body.js rewrite:

| Addition | What it does |
|----------|-------------|
| `getRecentOrderedIds()` | Reads `foodrush_orders`, deduplicates, returns up to 6 restaurant IDs |
| `recentlyOrdered` (useMemo) | Cross-references IDs with live restaurants. Empty if no order history. |
| `recommendations` (useMemo) | Scores restaurants by cuisine overlap with `getTopPreferred(5)`. Returns top 8. |
| `HorizontalStrip` sub-component | Renders a titled horizontal scroll row of RestaurantCards. Returns null if empty. |
| `browsing` derived boolean | `!isFiltering(filters, searchText)` — controls when strips are shown |
| `trackCuisines` on card click | Passed as `onCardClick` to both strips and all main grid links |

### Modified: `src/utils/usePreferences.js`
Already created in Phase 3. Phase 4 uses `getTopPreferred(5)` for the recommendation score.

---

## Tasks

- [x] **Task 1 (Phase 3)** — `usePreferences.js` — cuisine preference tracking hook
- [x] **Task 2 (Phase 3/4)** — `Body.js` — full rewrite with filters + intelligence strips
- [x] **Task 3** — `RestaurantMenu.js` — bestseller badge on menu items

---

## Data Flow (End to End)

```
User clicks restaurant card
  → trackCuisines(restaurant.info.cuisines) called
    → foodrush_prefs incremented in localStorage

User places order in Cart.js
  → { restaurantId, restaurantName, items, total } saved to foodrush_orders

Next visit to Body.js (or page refresh)
  → getRecentOrderedIds() reads foodrush_orders → returns IDs
  → recentlyOrdered useMemo cross-refs IDs with live restaurants
  → getTopPreferred(5) reads foodrush_prefs → returns top cuisines
  → recommendations useMemo scores all restaurants by cuisine overlap
  → Both strips render if browsing (no active filter/search)
```

---

## Problems Faced

### Problem — Strips show up even for new users (no data)
**The challenge:** A first-time user has no order history and no cuisine preferences.
Both strips would show 0 results.
**Solution built-in:** `HorizontalStrip` returns `null` if `restaurants.length === 0`.
`recentlyOrdered` will be empty (no orders), `recommendations` will be empty (`preferred.length === 0` check).
New users see a clean listing. Strips appear organically as data accumulates.

---

### Problem — Recommendations could show the same restaurant as "Order Again"
**The challenge:** A restaurant you've ordered from could also match your preferred cuisines.
It would appear in both strips.
**Decision:** Allow duplication. The strips have different semantic meaning — "you ordered there"
vs "this matches your taste". Seeing the same restaurant in both strips actually reinforces that it's
a good choice. The main grid below will show it too.
**Not worth adding de-duplication logic** — it adds complexity for a cosmetic issue.

---

### Problem — Preference tracking only increments, never decays
**The challenge:** If you click biryani 10 times in month 1, then stop caring about biryani,
your preferences will still say "biryani" forever.
**Current state:** No decay. Click counts accumulate indefinitely.
**Why acceptable now:** This is a personal tool. Lavish can clear `foodrush_prefs` from localStorage
if preferences drift. A decay model (e.g. weight recent clicks more) is a future enhancement.

---

## localStorage Keys After Phase 4

| Key | What | Set by |
|-----|------|--------|
| `foodrush_city` | Current city `{ name, lat, lng }` | Header.js |
| `foodrush_favourites` | Saved restaurants (full objects) | useFavourites.js |
| `foodrush_cart` | Active cart `{ restaurantId, restaurantName, items[] }` | CartContext.js |
| `foodrush_orders` | Past orders `[{ id, placedAt, restaurantName, items[], total }]` | Cart.js |
| `foodrush_prefs` | Cuisine click counts `{ "Biryani": 4, "Pizza": 2 }` | usePreferences.js |

---

## What This Enables Next (Phase 5 Ideas)

- **Surprise me** button — pick a random restaurant from recommendations
- **Cuisine preference breakdown** — show the user a mini profile of their own tastes
- **Time-aware suggestions** — breakfast cuisines before noon, dinner cuisines after 7pm (check `new Date().getHours()`)
- **Preference decay** — weight recent clicks more heavily than old ones
- **Shared wishlists** — export favourites as a JSON link (URL-encoded, no backend needed)
