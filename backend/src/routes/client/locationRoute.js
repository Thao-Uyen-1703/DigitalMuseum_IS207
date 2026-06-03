const express = require('express');
const router = express.Router();
const locationController = require('../../controllers/client/locationController');

router.get('/', locationController.getAllLocations);

router.get('/:id', locationController.findLocationByID);

module.exports = router;