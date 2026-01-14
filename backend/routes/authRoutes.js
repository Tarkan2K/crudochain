const express = require('express');
const router = express.Router();
const { register, login, getAdminBalance } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/admin-balance', getAdminBalance);

module.exports = router;
