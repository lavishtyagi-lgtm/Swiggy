// src/utils/mockData.js
export const MOCK_GROCERY_DATA = {
  data: {
    data: {
      slottedDeliveryAvailable: false,
      comms: {
        nudgeComms: {
          success: {
            highlight: "FREE DELIVERY",
            suffix: "on orders above ₹49",
            progressiveBarPercentage: 40,
          }
        },
        couponlessOffersComms: {
          "1": { highlight: null, text: "Add Air Purifier items worth ₹1 more to avail this offer" },
          "2": { highlight: "FLAT 5% OFF", text: "Unlock {highlight} on Arata items" },
          "3": { highlight: "FLAT ₹50 OFF", text: "Unlock {highlight} on Huggies items" }
        }
      },
      pharmaCart: false
    }
  }
};