import { useState, useEffect } from "react";

const STORAGE_KEY = "foodrush_favourites";

const readFavourites = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useFavourites = () => {
  const [favourites, setFavourites] = useState(readFavourites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  }, [favourites]);

  const isFavourite = (id) => favourites.some((r) => r.info.id === id);

  const toggleFavourite = (restaurant) => {
    setFavourites((prev) =>
      prev.some((r) => r.info.id === restaurant.info.id)
        ? prev.filter((r) => r.info.id !== restaurant.info.id)
        : [...prev, restaurant]
    );
  };

  return { favourites, toggleFavourite, isFavourite };
};
