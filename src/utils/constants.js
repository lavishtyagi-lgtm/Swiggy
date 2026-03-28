export const LOGO_URL =
  "https://marketplace.canva.com/EAFzpoIF_lk/2/0/1200w/canva-yellow-and-orange-vibrant-typography-food-restaurant-logo-ntbWOOv9Hig.png";

export const REST_LOGO_URL =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";

export const CITIES = [
  { name: "Pune",      lat: "18.5204303", lng: "73.8567437" },
  { name: "Delhi",     lat: "28.6139391", lng: "77.2090212" },
  { name: "Mumbai",    lat: "19.0759837", lng: "72.8776559" },
  { name: "Bangalore", lat: "12.9715987", lng: "77.5945627" },
  { name: "Hyderabad", lat: "17.385044",  lng: "78.4863946" },
  { name: "Chennai",   lat: "13.0826802", lng: "80.2707184" },
  { name: "Kolkata",   lat: "22.572646",  lng: "88.363895"  },
  { name: "Ahmedabad", lat: "23.022505",  lng: "72.5713621" },
];

export const DEFAULT_CITY = CITIES[0];

export const getStoredCity = () => {
  try {
    const stored = localStorage.getItem("foodrush_city");
    return stored ? JSON.parse(stored) : DEFAULT_CITY;
  } catch {
    return DEFAULT_CITY;
  }
};

export const getRestaurantsUrl = (lat, lng) =>
  `http://localhost:3000/api/restaurants?lat=${lat}&lng=${lng}&page_type=DESKTOP_WEB_LISTING`;

export const getMenuUrl = (lat, lng, restaurantId) =>
  `http://localhost:3000/api/menu?lat=${lat}&lng=${lng}&restaurantId=${restaurantId}`;
