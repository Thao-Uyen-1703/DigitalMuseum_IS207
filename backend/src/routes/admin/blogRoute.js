const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/admin/blogController');
const authMiddleware = require('../../middleware/authMiddleware');
const uploadMiddleware = require('../../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/', blogController.getAll);

router.post('/:id', uploadMiddleware.any(), blogController.create);
router.put('/:id', uploadMiddleware.any(), blogController.update);

router.put('/:id', blogController.update);
router.delete('/:id', blogController.delete);

module.exports = router;