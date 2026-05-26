const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/client/checkoutController');
const optionalAuthMiddleware = require('../../middleware/optionalAuthMiddleware');

router.post('/', optionalAuthMiddleware ,checkoutController.createOrder);

module.exports = router;