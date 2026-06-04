const express = require('express');
const router = express.Router();
const productController = require('../../controllers/client/productController');
const optionalAuthMiddleware = require('../../middleware/optionalAuthMiddleware');

// Đọc danh sách (READ ALL) -> GET /api/product
router.get('/', productController.getAllProductByFilters);

// Product suggestions by search query -> GET /api/product/suggestions?q=...
router.get('/suggestions', productController.searchSuggestions);

// Landing page featured products -> GET /api/product/landing?limit=5
router.get('/landing', productController.getLandingProducts);

// Đọc chi tiết sản phẩm theo slug hoặc id -> GET /api/product/:slugOrId
router.get('/:name', optionalAuthMiddleware, productController.getProductDetails);

module.exports = router;