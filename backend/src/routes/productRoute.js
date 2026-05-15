
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Đọc danh sách (READ ALL) -> GET /api/users/
router.get('/', productController.getAllProductByFilters);

// router.get('/:id', productController.findProductById);

module.exports = router;