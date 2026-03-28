import React, { useState, useEffect } from "react";
import { MOCK_GROCERY_DATA } from "../utils/mockData";

const Grocery = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating an API call
    setTimeout(() => {
      // In a real app, you'd use: fetch(API).then(res => res.json())
      // Here we use the data you provided in the prompt
      setCartData(MOCK_GROCERY_DATA?.data?.data);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading your offers...</div>;

  if (!cartData || !cartData.comms) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-500">Cart Not Found</h2>
        <p className="text-gray-500">Please add items from the store to see active offers.</p>
      </div>
    );
  }

  const successNudge = cartData.comms.nudgeComms?.success;
  const offers = cartData.comms.couponlessOffersComms || {};

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-black mb-6 border-b pb-2">Instamart Offers</h1>

      {/* Delivery Nudge Section */}
      {successNudge && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-2xl mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-800 font-semibold text-lg">
              <strong>{successNudge.highlight}</strong> {successNudge.suffix}
            </span>
            <span className="text-2xl">🚚</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-1000"
              style={{ width: `${successNudge.progressiveBarPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Finish your order to get this deal!</p>
        </div>
      )}

      {/* Brand Offers Section */}
      <div className="grid gap-4">
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">Available Brand Discounts</h3>
        {Object.entries(offers).map(([id, offer]) => {
          const parts = offer.highlight
            ? offer.text.split("{highlight}")
            : [offer.text];
          return (
            <div key={id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50">
              <div className="bg-orange-100 p-2 rounded-lg">
                <span className="text-orange-600">🏷️</span>
              </div>
              <p className="text-gray-700 text-sm font-medium">
                {parts[0]}
                {offer.highlight && <strong>{offer.highlight}</strong>}
                {parts[1]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <footer className="mt-10 pt-6 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
         <div className="flex items-center gap-1">
            <span className={cartData.slottedDeliveryAvailable ? "text-green-500" : "text-red-400"}>●</span>
            Slotted Delivery
         </div>
         <div className="flex items-center gap-1">
            <span className={cartData.pharmaCart ? "text-green-500" : "text-gray-300"}>●</span>
            Pharma Items
         </div>
      </footer>
    </div>
  );
};

export default Grocery;