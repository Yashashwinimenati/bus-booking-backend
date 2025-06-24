const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');
const { validate, createBookingSchema } = require('../middleware/validation');

// All booking routes require authentication
router.use(authenticateToken);

// Create booking
router.post('/create', validate(createBookingSchema), bookingController.createBooking);

// Get user's booking history
router.get('/', bookingController.getBookings);

// Get specific booking details
router.get('/:bookingId', bookingController.getBookingDetails);

// Cancel booking
router.post('/:bookingId/cancel', bookingController.cancelBooking);

module.exports = router; 