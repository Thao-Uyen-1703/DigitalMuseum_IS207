const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/client/profileController');
const authMiddleware = require('../../middleware/authMiddleware');
const uploadMiddleware = require('../../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/', (req, res, next) => {
    const upload = uploadMiddleware.single('image');
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "Lỗi tải ảnh",
                errors: { image: err.message }
            });
        }
        next();
    });
}, profileController.updateProfile);

module.exports = router;