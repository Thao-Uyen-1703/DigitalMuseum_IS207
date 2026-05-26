
const express = require('express');
const router = express.Router();
const shipmentController = require('../../controllers/client/shipmentController');

router.get('/', shipmentController.getMethods);

module.exports = router;