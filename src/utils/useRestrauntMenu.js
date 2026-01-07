import { useEffect } from "react";
import { MENU_URL } from "../utils/constants";

export const useRestrauntMenu = (resId) => {
    useEffect(() => {
     fetchMenu();
     console.log("Fetching menu for restaurant ID:", resId);
    }, []);

  const fetchMenu = async () => {
      const response = await fetch(MENU_URL + resId);
      console.log("Menu Data:", response);
  };
}