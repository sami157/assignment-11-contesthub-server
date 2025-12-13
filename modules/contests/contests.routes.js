const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');
const { usersCollection } = require('../../config/connectMongoDB');
const { requireRole } = require('../../middleware/requireRole');
const { createContest, getContestsByCreator } = require('./contest.controller');

router.post('/', verifyFirebaseToken(usersCollection), requireRole('creator'), createContest)
router.get("/creator/:email", verifyFirebaseToken(usersCollection), requireRole('creator'), getContestsByCreator);

module.exports = router;