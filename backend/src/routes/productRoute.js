
const express = require('express');
const router = express.Router();
const sanphamController = require('../controllers/sanphamController');

// Đọc danh sách (READ ALL) -> GET /api/users/
router.get('/', sanphamController.getAllProducts);

router.get('/:id', sanphamController.findProductById);

module.exports = router;