import { useCallback } from "react";

const STORAGE_KEY = "foodrush_prefs";

const readPrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

export const usePreferences = () => {
  // Call this when a user clicks into a restaurant
  const trackCuisines = useCallback((cuisines = []) => {
    try {
      const prefs = readPrefs();
      cuisines.forEach((c) => { prefs[c] = (prefs[c] || 0) + 1; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }, []);

  // Returns the N most-clicked cuisine names
  const getTopPreferred = useCallback((n = 5) => {
    const prefs = readPrefs();
    return Object.entries(prefs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([cuisine]) => cuisine);
  }, []);

  return { trackCuisines, getTopPreferred };
};
