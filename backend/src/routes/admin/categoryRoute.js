const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categoryController');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('Staff', 'Manager', 'Admin'));

router.get('/', categoryController.getAllCategory);
router.post('/', categoryController.create);

router.put('/:id', roleMiddleware('Manager', 'Admin'), categoryController.update);
router.delete('/:id', roleMiddleware('Manager', 'Admin'), categoryController.delete);

module.exports = router;
