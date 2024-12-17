const express = require("express");
const { checkoutSession } = require("../controller/paymentController");
const router = express.Router();

router.post("/create-checkout-session", checkoutSession);

module.exports = router;
