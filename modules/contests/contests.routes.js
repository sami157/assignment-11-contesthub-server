const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');
const { usersCollection } = require('../../config/connectMongoDB');
const { requireRole } = require('../../middleware/requireRole');
const { createContest, getContestsByCreator, deleteContest, updateContest, getContests, updateContestStatus, getApprovedContests, getPopularContests, getContestById, submitContestTask, declareWinner, getMyWinningContests, searchContests, getWinners, getPlatformStats, getLeaderboard } = require('./contest.controller');

router.get('/all', verifyFirebaseToken(usersCollection), requireRole('admin'), getContests)
router.get('/', getApprovedContests)
router.get('/popular', getPopularContests)
router.get('/search', searchContests)
router.get("/winners", getWinners);
router.get("/leaderboard", getLeaderboard);
router.get("/platform-stats", getPlatformStats);
router.get('/winning-contests', verifyFirebaseToken(usersCollection), getMyWinningContests)
router.get('/:id', verifyFirebaseToken(usersCollection), getContestById)
router.post('/', verifyFirebaseToken(usersCollection), requireRole('creator'), createContest)
router.get("/creator/:email", verifyFirebaseToken(usersCollection), requireRole('creator'), getContestsByCreator);
router.delete("/delete/:id", verifyFirebaseToken(usersCollection), requireRole(['admin','creator']), deleteContest);
router.put("/update/:id", verifyFirebaseToken(usersCollection), requireRole('creator'), updateContest);
router.put("/update-status/:id", verifyFirebaseToken(usersCollection), requireRole('admin'), updateContestStatus);
router.post("/submit-task/:id", verifyFirebaseToken(usersCollection), requireRole(['admin', 'user', 'creator']), submitContestTask);
router.put("/:contestId/declare-winner", verifyFirebaseToken(usersCollection), requireRole(["creator", "admin"]),declareWinner);


module.exports = router;