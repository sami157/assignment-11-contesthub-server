const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');
const { usersCollection } = require('../../config/connectMongoDB');
const { requireRole } = require('../../middleware/requireRole');
const { createContest, getContestsByCreator, deleteContest, updateContest, getContests, updateContestStatus, getApprovedContests, getPopularContests } = require('./contest.controller');

router.get('/all', verifyFirebaseToken(usersCollection), requireRole('admin'), getContests)
router.get('/', getApprovedContests)
router.get('/popular', getPopularContests)
router.post('/', verifyFirebaseToken(usersCollection), requireRole('creator'), createContest)
router.get("/creator/:email", verifyFirebaseToken(usersCollection), requireRole('creator'), getContestsByCreator);
router.delete("/delete/:id", verifyFirebaseToken(usersCollection), requireRole(['admin','creator']), deleteContest);
router.put("/update/:id", verifyFirebaseToken(usersCollection), requireRole('creator'), updateContest);
router.put("/update-status/:id", verifyFirebaseToken(usersCollection), requireRole('admin'), updateContestStatus);

module.exports = router;