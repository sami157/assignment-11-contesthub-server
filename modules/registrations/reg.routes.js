const express = require("express");
const { usersCollection } = require("../../config/connectMongoDB");
const { checkRegistration, getMyParticipatedContests } = require("./reg.controller");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

const router = express.Router();

router.get("/check/:contestId", verifyFirebaseToken(usersCollection), checkRegistration)
router.get("/my-contests", verifyFirebaseToken(usersCollection), getMyParticipatedContests);


module.exports = router;