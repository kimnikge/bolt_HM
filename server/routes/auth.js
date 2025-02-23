const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth');
const { telegramAuth } = require('../controllers/telegramAuth');

router.post('/register', register);
router.post('/login', login);
router.post('/telegram/auth', telegramAuth);

module.exports = router;
