import { Link } from "react-router-dom";
import RestaurantCard from "./RestaurantCard";
import { useFavourites } from "../utils/useFavourites";

export function Favourites() {
  const { favourites, toggleFavourite, isFavourite } = useFavourites();

  if (favourites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-6xl mb-4">🤍</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No favourites yet</h2>
        <p className="text-gray-400 text-sm mb-6">Tap the heart on any restaurant to save it here</p>
        <Link to="/" className="px-6 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Your Favourites</h1>
          <p className="text-sm text-gray-400 mt-0.5">{favourites.length} saved restaurant{favourites.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
        {favourites.map((restaurant) => (
          <Link key={restaurant.info.id} to={"/restaurants/" + restaurant.info.id}>
            <RestaurantCard
              resInfo={restaurant}
              isFavourite={isFavourite(restaurant.info.id)}
              onToggleFavourite={toggleFavourite}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
