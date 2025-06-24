const database = require('../config/database');
const { generateBookingReference } = require('../utils/helpers');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, BOOKING_STATUS } = require('../utils/constants');

// Create booking
const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { scheduleId, travelDate, boardingPoint, droppingPoint, passengers } = req.body;

        // Validate schedule exists
        const schedule = await database.get(`
            SELECT bs.id, bs.base_price, b.total_seats
            FROM bus_schedules bs
            JOIN buses b ON bs.bus_id = b.id
            WHERE bs.id = ? AND bs.is_active = 1
        `, [scheduleId]);

        if (!schedule) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Check seat availability
        const bookedSeatsResult = await database.get(`
            SELECT COUNT(*) as bookedCount
            FROM passengers p
            JOIN bookings b ON p.booking_id = b.id
            WHERE b.schedule_id = ? 
            AND b.travel_date = ? 
            AND b.status != 'cancelled'
        `, [scheduleId, travelDate]);

        const bookedSeats = bookedSeatsResult ? bookedSeatsResult.bookedCount : 0;
        const availableSeats = schedule.total_seats - bookedSeats;

        if (passengers.length > availableSeats) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: ERROR_MESSAGES.INSUFFICIENT_SEATS
            });
        }

        // Check if requested seats are already booked
        const requestedSeats = passengers.map(p => p.seatNumber);
        const existingBookedSeats = await database.all(`
            SELECT p.seat_number
            FROM passengers p
            JOIN bookings b ON p.booking_id = b.id
            WHERE b.schedule_id = ? 
            AND b.travel_date = ? 
            AND b.status != 'cancelled'
            AND p.seat_number IN (${requestedSeats.map(() => '?').join(',')})
        `, [scheduleId, travelDate, ...requestedSeats]);

        if (existingBookedSeats.length > 0) {
            const bookedSeatNumbers = existingBookedSeats.map(s => s.seat_number);
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: `Seats ${bookedSeatNumbers.join(', ')} are already booked`
            });
        }

        // Calculate total amount
        const totalAmount = schedule.base_price * passengers.length;

        // Generate booking reference
        const bookingReference = generateBookingReference();

        // Create booking using transaction
        await database.transaction(async (db) => {
            // Insert booking
            const bookingResult = await db.run(`
                INSERT INTO bookings (booking_reference, user_id, schedule_id, travel_date, boarding_point, dropping_point, total_amount, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [bookingReference, userId, scheduleId, travelDate, boardingPoint, droppingPoint, totalAmount, BOOKING_STATUS.PENDING]);

            const bookingId = bookingResult.id;

            // Insert passengers
            for (const passenger of passengers) {
                await db.run(`
                    INSERT INTO passengers (booking_id, name, age, gender, seat_number)
                    VALUES (?, ?, ?, ?, ?)
                `, [bookingId, passenger.name, passenger.age, passenger.gender, passenger.seatNumber]);
            }
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.BOOKING_CREATED,
            bookingReference: bookingReference,
            totalAmount: totalAmount,
            bookingId: bookingId
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Get user's booking history
const getBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        const offset = (page - 1) * limit;

        // Build query
        let query = `
            SELECT 
                b.id,
                b.booking_reference,
                b.travel_date,
                b.boarding_point,
                b.dropping_point,
                b.total_amount,
                b.status,
                b.created_at,
                bs.departure_time,
                bs.arrival_time,
                bus.bus_number,
                bus.bus_type,
                bo.name as operator_name,
                r.source_city,
                r.destination_city
            FROM bookings b
            JOIN bus_schedules bs ON b.schedule_id = bs.id
            JOIN buses bus ON bs.bus_id = bus.id
            JOIN bus_operators bo ON bus.operator_id = bo.id
            JOIN routes r ON bs.route_id = r.id
            WHERE b.user_id = ?
        `;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM bookings b
            WHERE b.user_id = ?
        `;

        let queryParams = [userId];
        let countParams = [userId];

        if (status) {
            query += ' AND b.status = ?';
            countQuery += ' AND b.status = ?';
            queryParams.push(status);
            countParams.push(status);
        }

        query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const [bookings, totalResult] = await Promise.all([
            database.all(query, queryParams),
            database.get(countQuery, countParams)
        ]);

        const total = totalResult ? totalResult.total : 0;

        // Get passengers for each booking
        const bookingsWithPassengers = await Promise.all(bookings.map(async (booking) => {
            const passengers = await database.all(`
                SELECT name, age, gender, seat_number
                FROM passengers
                WHERE booking_id = ?
            `, [booking.id]);

            return {
                id: booking.id,
                bookingReference: booking.booking_reference,
                travelDate: booking.travel_date,
                boardingPoint: booking.boarding_point,
                droppingPoint: booking.dropping_point,
                totalAmount: booking.total_amount,
                status: booking.status,
                createdAt: booking.created_at,
                departureTime: booking.departure_time,
                arrivalTime: booking.arrival_time,
                busNumber: booking.bus_number,
                busType: booking.bus_type,
                operatorName: booking.operator_name,
                sourceCity: booking.source_city,
                destinationCity: booking.destination_city,
                passengers: passengers
            };
        }));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            bookings: bookingsWithPassengers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Get booking details
const getBookingDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;

        const booking = await database.get(`
            SELECT 
                b.id,
                b.booking_reference,
                b.travel_date,
                b.boarding_point,
                b.dropping_point,
                b.total_amount,
                b.status,
                b.created_at,
                bs.departure_time,
                bs.arrival_time,
                bus.bus_number,
                bus.bus_type,
                bo.name as operator_name,
                bo.contact_number as operator_contact,
                r.source_city,
                r.destination_city
            FROM bookings b
            JOIN bus_schedules bs ON b.schedule_id = bs.id
            JOIN buses bus ON bs.bus_id = bus.id
            JOIN bus_operators bo ON bus.operator_id = bo.id
            JOIN routes r ON bs.route_id = r.id
            WHERE b.id = ? AND b.user_id = ?
        `, [bookingId, userId]);

        if (!booking) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.BOOKING_NOT_FOUND
            });
        }

        // Get passengers
        const passengers = await database.all(`
            SELECT name, age, gender, seat_number
            FROM passengers
            WHERE booking_id = ?
        `, [bookingId]);

        // Get payment status
        const payment = await database.get(`
            SELECT status, payment_method, payment_date
            FROM payments
            WHERE booking_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [bookingId]);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            booking: {
                id: booking.id,
                bookingReference: booking.booking_reference,
                travelDate: booking.travel_date,
                boardingPoint: booking.boarding_point,
                droppingPoint: booking.dropping_point,
                totalAmount: booking.total_amount,
                status: booking.status,
                createdAt: booking.created_at,
                departureTime: booking.departure_time,
                arrivalTime: booking.arrival_time,
                busNumber: booking.bus_number,
                busType: booking.bus_type,
                operatorName: booking.operator_name,
                operatorContact: booking.operator_contact,
                sourceCity: booking.source_city,
                destinationCity: booking.destination_city,
                passengers: passengers,
                payment: payment
            }
        });
    } catch (error) {
        console.error('Get booking details error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;

        // Check if booking exists and belongs to user
        const booking = await database.get(`
            SELECT id, status, travel_date
            FROM bookings
            WHERE id = ? AND user_id = ?
        `, [bookingId, userId]);

        if (!booking) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.BOOKING_NOT_FOUND
            });
        }

        if (booking.status === BOOKING_STATUS.CANCELLED) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        // Check if travel date is in the future (allow cancellation only for future bookings)
        const today = new Date().toISOString().split('T')[0];
        if (booking.travel_date <= today) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Cannot cancel booking for past or today\'s travel date'
            });
        }

        // Update booking status
        const result = await database.run(`
            UPDATE bookings 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [BOOKING_STATUS.CANCELLED, bookingId]);

        if (result.changes === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.BOOKING_NOT_FOUND
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.BOOKING_CANCELLED
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

module.exports = {
    createBooking,
    getBookings,
    getBookingDetails,
    cancelBooking
}; 