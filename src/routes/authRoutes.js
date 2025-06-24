const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, updateProfileSchema } = require('../middleware/validation');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validate(updateProfileSchema), authController.updateProfile);

module.exports = router; 