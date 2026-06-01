const express = require('express');
const router = express.Router();
const locationController = require('../../controllers/admin/locationController');
const uploadMiddleware = require('../../middleware/uploadMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('Staff', 'Manager', 'Admin'));

router.get('/', locationController.getAll);
router.get('/:id', locationController.getById);
router.post('/', uploadMiddleware.single('image'), locationController.create);
router.put('/:id', uploadMiddleware.single('image'), locationController.update);
router.delete('/:id', roleMiddleware('Manager', 'Admin'), locationController.delete);

module.exports = router;
