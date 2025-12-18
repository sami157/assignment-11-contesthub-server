const express = require("express");
const { usersCollection } = require("../../config/connectMongoDB");
const { checkRegistration } = require("./reg.controller");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

const router = express.Router();

router.get("/check/:contestId", verifyFirebaseToken(usersCollection), checkRegistration)

module.exports = router;