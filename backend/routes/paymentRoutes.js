const express = require('express');
const router = express.Router();
const { createPreference, webhook } = require('../controllers/paymentController');

router.post('/create_preference', createPreference);
router.post('/webhook', webhook);

module.exports = router;
