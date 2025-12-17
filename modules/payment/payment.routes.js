const express = require("express");
const { createCheckoutSession } = require("./payment.controller");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const { usersCollection } = require("../../config/connectMongoDB");

const router = express.Router();

router.post("/create-payment-session", verifyFirebaseToken(usersCollection), createCheckoutSession)

module.exports = router;