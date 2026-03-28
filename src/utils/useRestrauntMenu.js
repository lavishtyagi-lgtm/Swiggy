import { useEffect, useState } from "react";
import { getMenuUrl, getStoredCity } from "../utils/constants";

export const useRestrauntMenu = (resId) => {
  const [resInfo, setResInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, [resId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const city = getStoredCity();
      const url = getMenuUrl(city.lat, city.lng, resId);
      let response;
      try {
        response = await fetch(url);
      } catch {
        throw new Error("Proxy server is not running. Start it with: npm run server");
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Swiggy returned status ${response.status}`);
      }
      const json = await response.json();
      if (!json.data) throw new Error("Swiggy menu API response format has changed.");
      setResInfo(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { resInfo, loading, error };
};
