import { REST_LOGO_URL } from "../utils/constants";

const RestaurantCard = (props) => {
  const { resInfo } = props;
  const {
    cloudinaryImageId,
    name,
    cuisines,
    avgRating,
    costForTwo,
    sla,
  } = resInfo.info; // Destructuring for cleaner code

  return (
    <div className="m-4 p-4 w-[200px] rounded-md justify-items-stretch bg-gray-100 hover:shadow-lg hover:bg-gray-300">
      <img
        className="rounded-lg flex"
        alt="res-logo"
        src={REST_LOGO_URL + cloudinaryImageId}
      />
      <h3 className="font-bold py-4 text-lg">{name}</h3>
      <h4>{cuisines.join(", ")}</h4>
      <h4>{avgRating} stars</h4>
      <h4>{costForTwo}</h4>
      <h4>{sla.deliveryTime} minutes</h4>
    </div>
  );
};
export default RestaurantCard;