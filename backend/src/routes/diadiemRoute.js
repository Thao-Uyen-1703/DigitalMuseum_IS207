const express = require('express');
const router = express.Router();
const diadiemController = require('../controllers/diadiemController');

// Đọc danh sách (READ ALL) -> GET /api/users/
router.get('/', diadiemController.getAllLocations);

router.get('/:id', diadiemController.findLocationByID);

module.exports = router;