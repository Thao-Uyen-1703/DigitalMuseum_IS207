
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', checkoutController.createOrder);

module.exports = router;