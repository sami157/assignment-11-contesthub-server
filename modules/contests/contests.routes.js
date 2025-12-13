const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');
const { usersCollection } = require('../../config/connectMongoDB');
const { requireRole } = require('../../middleware/requireRole');
const { createContest, getContestsByCreator, deleteContest, updateContest } = require('./contest.controller');

router.post('/', verifyFirebaseToken(usersCollection), requireRole('creator'), createContest)
router.get("/creator/:email", verifyFirebaseToken(usersCollection), requireRole('creator'), getContestsByCreator);
router.delete("/delete/:id", verifyFirebaseToken(usersCollection), requireRole('creator'), deleteContest);
router.put("/update/:id", verifyFirebaseToken(usersCollection), requireRole('creator'), updateContest);

module.exports = router;