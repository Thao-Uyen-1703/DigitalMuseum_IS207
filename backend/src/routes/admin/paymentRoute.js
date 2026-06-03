const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/admin/paymentController');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', paymentController.create);
router.put('/:id', paymentController.update)

module.exports = router;
