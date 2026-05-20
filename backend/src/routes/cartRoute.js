const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', cartController.getUserCart);
router.post('/', cartController.addItemToCart);
router.post('/merge', cartController.mergeCart);
router.put('/:id', cartController.updateCartItemQuantity);
router.delete('/:id', cartController.removeCartItem);

module.exports = router;