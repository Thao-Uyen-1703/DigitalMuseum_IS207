const express = require('express');
const router = express.Router();
const statisticsController = require('../../controllers/admin/statisticsController');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/overview', statisticsController.getStatistics);
router.get('/chart/revenue', statisticsController.getChartRevenue);
router.get('/chart/category', statisticsController.getCategoryTopSales);
router.get('/chart/recent-orders', statisticsController.getRecentOrders);

module.exports = router;