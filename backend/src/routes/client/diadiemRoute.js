const express = require('express');
const router = express.Router();
const diadiemController = require('../../controllers/client/diadiemController');

// Đọc danh sách (READ ALL) -> GET /api/users/
router.get('/', diadiemController.getAllLocations);

router.get('/:id', diadiemController.findLocationByID);

module.exports = router;