const express = require('express');
const router = express.Router();


const { createUser } = require('./users.controller');

router.post('/', createUser); 

module.exports = router;
