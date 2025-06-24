const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { validate, paymentSchema } = require('../middleware/validation');

// All payment routes require authentication
router.use(authenticateToken);

// Initiate payment
router.post('/initiate', validate(paymentSchema), paymentController.initiatePayment);

// Confirm payment (webhook simulation)
router.post('/confirm', paymentController.confirmPayment);

// Get payment status for a booking
router.get('/:bookingId/status', paymentController.getPaymentStatus);

module.exports = router; 