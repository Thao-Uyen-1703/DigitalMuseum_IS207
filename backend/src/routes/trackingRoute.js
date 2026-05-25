const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

router.post('/', trackingController.getGuestOrder);

module.exports = router;