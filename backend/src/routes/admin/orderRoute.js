const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddlware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddlware('Staff', 'Manager', 'Admin'));

router.get('/', orderController.getAll);
router.get('/:id', orderController.getDetails);
router.post('/', orderController.create);
router.put('/:id', orderController.update);
router.delete('/:id', orderController.delete);

module.exports = router;
