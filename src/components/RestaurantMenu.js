import { useEffect , useState } from "react";
import { useParams } from "react-router-dom";
import { MENU_URL } from "../utils/constants";
import { useRestrauntMenu } from "../utils/useRestrauntMenu";

export function RestaurantMenu(resID) {
  // If menu data exists, render it dynamically

  const { resId } = useParams();
  console.log("resID", resId);

  const menuData = useRestrauntMenu(resId);
  
  return (
    <div className="menu">
      <h1>name</h1>
      <h1>RestaurantId {resId}</h1>
      <h1>Restaurant Menu</h1>
      <ul></ul>
      <div>No menu items available.</div>
    </div>
  );
}
