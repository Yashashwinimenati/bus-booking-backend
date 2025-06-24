const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { validateQuery, busSearchSchema } = require('../middleware/validation');

// Public routes
router.get('/search', validateQuery(busSearchSchema), busController.searchBuses);
router.get('/:scheduleId/seats', busController.getSeatAvailability);

module.exports = router; 