const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const uploadMiddleware = require('../../middleware/uploadMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddlware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddlware('Staff', 'Manager', 'Admin'));

router.get('/', productController.getAll);
router.get('/:id', productController.getById);

router.post('/', uploadMiddleware.single('image'), productController.create);
router.put('/:id', uploadMiddleware.single('image'), productController.update);

router.patch('/:id/toggle-status', roleMiddlware('Manager', 'Admin'), productController.toggleStatus);
router.delete('/:id', roleMiddlware('Manager', 'Admin') ,productController.delete);

module.exports = router;