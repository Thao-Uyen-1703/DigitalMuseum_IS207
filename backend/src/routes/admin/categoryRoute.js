const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categoryController');
const authMiddleware = require('../../middleware/authMiddleware');

// router.use(authMiddleware);

router.get('/', categoryController.getAllCategory);

module.exports = router;
