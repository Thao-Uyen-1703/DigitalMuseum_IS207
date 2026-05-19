
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Đọc danh sách (READ ALL) -> GET /api/product
router.get('/', productController.getAllProductByFilters);

// Đọc chi tiết sản phẩm theo slug hoặc id -> GET /api/product/:slugOrId
router.get('/:name', productController.getProductDetails);

module.exports = router;