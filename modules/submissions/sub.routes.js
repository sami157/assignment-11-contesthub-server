const express = require("express");
const { usersCollection } = require("../../config/connectMongoDB");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const { getSubmissionsByCreator } = require("./sub.controller");

const router = express.Router();

router.get("/creator/:email", verifyFirebaseToken(usersCollection), getSubmissionsByCreator)

module.exports = router;
