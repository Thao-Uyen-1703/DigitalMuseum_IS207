const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('Staff', 'Manager', 'Admin'));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', roleMiddleware('Manager', 'Admin'), userController.updateUser);

module.exports = router;
