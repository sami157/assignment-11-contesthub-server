const express = require('express');
const router = express.Router();
const { createUser, changeRole, getUsers, getUserRole } = require('./users.controller');
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');
const { usersCollection } = require('../../config/connectMongoDB');
const { requireRole } = require('../../middleware/requireRole');

router.post('/', createUser)
router.get('/get-role/:email', getUserRole)
router.get('/', verifyFirebaseToken(usersCollection), requireRole('admin'), getUsers)
router.put('/update-role/:email', verifyFirebaseToken(usersCollection), requireRole('admin'), changeRole) 

module.exports = router;