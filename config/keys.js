require("dotenv").config();

module.exports = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  apiKey: process.env.STRIPE_API_KEY,
  paymentBaseURL: process.env.PAYMENT_BASE_URL,
};
