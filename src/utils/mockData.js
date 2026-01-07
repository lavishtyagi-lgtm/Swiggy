// src/utils/mockData.js
export const MOCK_GROCERY_DATA = {
  data: {
    data: {
      slottedDeliveryAvailable: false,
      comms: {
        nudgeComms: {
          success: {
            text: "<b>FREE DELIVERY</b> on orders above ₹49",
            progressiveBarPercentage: 40,
          }
        },
        couponlessOffersComms: {
          "1": { text: "Add Air Purifier items worth ₹1 more to avail this offer" },
          "2": { text: "Unlock <b>FLAT 5% OFF</b> on Arata items" },
          "3": { text: "Unlock <b>FLAT ₹50 OFF</b> on Huggies items" }
        }
      },
      pharmaCart: false
    }
  }
};