const database = require('../config/database');
const { calculateDuration, formatTime, parseAmenities, generateSeatLayout } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES, TIME_SLOTS } = require('../utils/constants');

// Search buses
const searchBuses = async (req, res) => {
    try {
        const { 
            source, 
            destination, 
            travelDate, 
            busType, 
            minPrice, 
            maxPrice, 
            departureTime 
        } = req.query;

        // Build the base query
        let query = `
            SELECT 
                bs.id as scheduleId,
                b.bus_number,
                bo.name as operatorName,
                b.bus_type,
                bs.departure_time,
                bs.arrival_time,
                bs.base_price as price,
                b.total_seats,
                b.amenities,
                bo.rating,
                r.source_city,
                r.destination_city
            FROM bus_schedules bs
            JOIN buses b ON bs.bus_id = b.id
            JOIN bus_operators bo ON b.operator_id = bo.id
            JOIN routes r ON bs.route_id = r.id
            WHERE r.source_city = ? 
            AND r.destination_city = ? 
            AND bs.is_active = 1
        `;

        let queryParams = [source, destination];

        // Add filters
        if (busType) {
            query += ' AND b.bus_type = ?';
            queryParams.push(busType);
        }

        if (minPrice) {
            query += ' AND bs.base_price >= ?';
            queryParams.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND bs.base_price <= ?';
            queryParams.push(maxPrice);
        }

        if (departureTime) {
            const timeFilter = getTimeFilter(departureTime);
            if (timeFilter) {
                query += ` AND ${timeFilter}`;
            }
        }

        query += ' ORDER BY bs.departure_time';

        const schedules = await database.all(query, queryParams);

        // Process results and add additional information
        const buses = await Promise.all(schedules.map(async (schedule) => {
            // Get booked seats count for the travel date
            const bookedSeatsResult = await database.get(`
                SELECT COUNT(*) as bookedCount
                FROM passengers p
                JOIN bookings b ON p.booking_id = b.id
                WHERE b.schedule_id = ? 
                AND b.travel_date = ? 
                AND b.status != 'cancelled'
            `, [schedule.scheduleId, travelDate]);

            const bookedSeats = bookedSeatsResult ? bookedSeatsResult.bookedCount : 0;
            const availableSeats = schedule.total_seats - bookedSeats;

            // Get boarding and dropping points
            const boardingPoints = await database.all(`
                SELECT location_name, pickup_time
                FROM boarding_points
                WHERE schedule_id = ?
                ORDER BY pickup_time
            `, [schedule.scheduleId]);

            const droppingPoints = await database.all(`
                SELECT location_name, drop_time
                FROM dropping_points
                WHERE schedule_id = ?
                ORDER BY drop_time
            `, [schedule.scheduleId]);

            return {
                scheduleId: schedule.scheduleId,
                busNumber: schedule.bus_number,
                operatorName: schedule.operatorName,
                busType: schedule.bus_type,
                departureTime: formatTime(schedule.departure_time),
                arrivalTime: formatTime(schedule.arrival_time),
                duration: calculateDuration(schedule.departure_time, schedule.arrival_time),
                price: schedule.price,
                availableSeats: availableSeats,
                totalSeats: schedule.total_seats,
                rating: schedule.rating,
                amenities: parseAmenities(schedule.amenities),
                boardingPoints: boardingPoints,
                droppingPoints: droppingPoints
            };
        }));

        // Filter out buses with no available seats
        const availableBuses = buses.filter(bus => bus.availableSeats > 0);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            count: availableBuses.length,
            buses: availableBuses
        });
    } catch (error) {
        console.error('Search buses error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Get seat layout and availability
const getSeatAvailability = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { travelDate } = req.query;

        if (!travelDate) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Travel date is required'
            });
        }

        // Get bus information
        const busInfo = await database.get(`
            SELECT b.bus_type, b.total_seats
            FROM bus_schedules bs
            JOIN buses b ON bs.bus_id = b.id
            WHERE bs.id = ?
        `, [scheduleId]);

        if (!busInfo) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Get booked seats for the travel date
        const bookedSeats = await database.all(`
            SELECT p.seat_number
            FROM passengers p
            JOIN bookings b ON p.booking_id = b.id
            WHERE b.schedule_id = ? 
            AND b.travel_date = ? 
            AND b.status != 'cancelled'
        `, [scheduleId, travelDate]);

        const bookedSeatNumbers = bookedSeats.map(seat => seat.seat_number);

        // Generate seat layout
        const seatLayout = generateSeatLayout(busInfo.bus_type, busInfo.total_seats);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            busType: busInfo.bus_type,
            seatLayout: seatLayout,
            bookedSeats: bookedSeatNumbers,
            totalSeats: busInfo.total_seats,
            availableSeats: busInfo.total_seats - bookedSeatNumbers.length
        });
    } catch (error) {
        console.error('Get seat availability error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Helper function to get time filter based on departure time preference
const getTimeFilter = (departureTime) => {
    switch (departureTime) {
        case TIME_SLOTS.MORNING:
            return 'bs.departure_time BETWEEN "06:00" AND "12:00"';
        case TIME_SLOTS.AFTERNOON:
            return 'bs.departure_time BETWEEN "12:00" AND "18:00"';
        case TIME_SLOTS.EVENING:
            return 'bs.departure_time BETWEEN "18:00" AND "22:00"';
        case TIME_SLOTS.NIGHT:
            return '(bs.departure_time >= "22:00" OR bs.departure_time < "06:00")';
        default:
            return null;
    }
};

module.exports = {
    searchBuses,
    getSeatAvailability
}; 