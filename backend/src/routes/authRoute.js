const express = require('express');
const router = express.Router();
const authController = require('../controllers/client/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.put('/change-password', authMiddleware, authController.changePassword);

router.post('/staff/login', authController.loginStaff);

module.exports = router;