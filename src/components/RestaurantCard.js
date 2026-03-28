import { REST_LOGO_URL } from "../utils/constants";

const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "white"} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const RestaurantCard = ({ resInfo, isFavourite, onToggleFavourite }) => {
  const { cloudinaryImageId, name, cuisines, avgRating, costForTwo, sla, aggregatedDiscountInfoV3 } = resInfo.info;

  const offer = aggregatedDiscountInfoV3?.header
    ? `${aggregatedDiscountInfoV3.header} ${aggregatedDiscountInfoV3.subHeader ?? ""}`.trim()
    : null;

  const ratingColor = avgRating >= 4 ? "bg-green-600" : avgRating >= 3 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="m-2 rounded-2xl bg-white hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer border border-gray-100 hover:-translate-y-0.5">
      <div className="relative overflow-hidden">
        <img
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          alt={name}
          src={cloudinaryImageId ? REST_LOGO_URL + cloudinaryImageId : "https://via.placeholder.com/300x160?text=No+Image"}
        />

        {/* Favourite button */}
        {onToggleFavourite && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavourite(resInfo); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            title={isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            <HeartIcon filled={isFavourite} />
          </button>
        )}

        {/* Rating badge */}
        <div className={`absolute bottom-2 left-2 flex items-center gap-1 ${ratingColor} text-white text-xs font-bold px-2 py-0.5 rounded-md`}>
          <span>★</span><span>{avgRating}</span>
        </div>

        {/* Offer banner */}
        {offer && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2">
            <p className="text-white text-xs font-bold truncate">{offer}</p>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-bold text-gray-900 text-sm truncate">{name}</h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{cuisines.join(", ")}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span className="font-medium">{sla?.deliveryTime} min</span>
          <span className="text-gray-300">•</span>
          <span>{costForTwo}</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
