const express = require('express');
const router = express.Router();
const shipmentController = require('../../controllers/admin/shipmentController');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', shipmentController.create);
router.put('/:id', shipmentController.update)

module.exports = router;
