const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const uploadMiddleware = require('../../middleware/uploadMiddleware');

// router.use();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);

router.post('/', uploadMiddleware.single('image'), productController.create);
router.put('/:id', uploadMiddleware.single('image'), productController.update);
router.patch('/:id/toggle-status', productController.toggleStatus);

router.delete('/:id', productController.delete);

module.exports = router;