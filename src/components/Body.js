import RestaurantCard from "./RestaurantCard";
import { useEffect, useState } from "react";
import Shimmer from "./Shimmer";
import { Link } from "react-router-dom";
import { RestaurantMenu } from "./RestaurantMenu";
import { FETCH_URL } from "../utils/constants";
import { useOnlineStatus } from "../utils/useOnlineStatus";
import { list } from "postcss";
// 4. Body Component (Using Map)
const Body = () => {
  //  state variable - siper powerful variable
  const [listofRestaurants, setlistofRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchText, setSearchText] = useState("");

  console.log("Body Rendered");
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await fetch(FETCH_URL);

    const json = await data.json();
    console.log(json);
    setlistofRestaurants(
      json?.data?.cards[1]?.card?.card?.gridElements.infoWithStyle.restaurants
    );
    setFilteredRestaurants(
      json?.data?.cards[1]?.card?.card?.gridElements.infoWithStyle.restaurants
    );
    // setlistofRestaurants(json?.data?.cards[4]?.card.card.gridElements.infoWithStyle.restaurants);
  };

  const onlineStatus = useOnlineStatus();
  if (onlineStatus === false) {
    return <h1>🔴 Offline, Please check your internet connection!!</h1>;
  }

  // conditional rendering
  if (listofRestaurants.length === 0) {
    console.log("render");
    return <Shimmer />;
  }

  return (
    <div className="body">
      <div className="filter flex m-4 p-4">
        <div className="search">
          <input
            type="text"
            className="border border-solid border-black px-2 m-2"
            placeholder="search"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
          />
          <button
            className="p-2  bg-blue-300 text-black rounded-md m-2"
            onClick={() => {
              // search text
              const filterdata = listofRestaurants.filter((res) =>
                res.info.name.toLowerCase().includes(searchText.toLowerCase())
              );
              setFilteredRestaurants(filterdata);
            }}
          >
            search
          </button>
        </div>
        <button
          className="p-2  bg-blue-300 text-black rounded-md m-2"
          onClick={() => {
            const filtered = listofRestaurants.filter(
              (res) => res.info.avgRating > 4
            );
            setFilteredRestaurants(filtered);
          }}
        >
          Top Rated Restaurants
        </button>
      </div>
      <div className="flex flex-wrap justify-evenly">
        {filteredRestaurants.map((restaurant) => (
          <Link
            key={restaurant.info.id}
            to={"/restaurants/" + restaurant.info.id}
          >
            {" "}
            <RestaurantCard resInfo={restaurant} />
          </Link>
        ))}
      </div>
    </div>
  );
};
export default Body;
