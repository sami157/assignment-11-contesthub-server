const express = require('express');
const router = express.Router();
const { createUser, changeRole, getUsers } = require('./users.controller');
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');
const { usersCollection } = require('../../config/connectMongoDB');
const { requireRole } = require('../../middleware/requireRole');

router.post('/', createUser)
router.get('/', verifyFirebaseToken(usersCollection), getUsers)
router.put('/update-role/:email', verifyFirebaseToken(usersCollection), requireRole('admin'), changeRole) 

module.exports = router;
