const database = require('../config/database');
const { generateTransactionId } = require('../utils/helpers');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, PAYMENT_STATUS, BOOKING_STATUS } = require('../utils/constants');

// Initiate payment
const initiatePayment = async (req, res) => {
    try {
        const { bookingId, paymentMethod } = req.body;

        // Check if booking exists and belongs to user
        const booking = await database.get(`
            SELECT id, total_amount, status
            FROM bookings
            WHERE id = ? AND user_id = ?
        `, [bookingId, req.user.id]);

        if (!booking) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.BOOKING_NOT_FOUND
            });
        }

        if (booking.status === BOOKING_STATUS.CANCELLED) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Cannot process payment for cancelled booking'
            });
        }

        // Check if payment already exists
        const existingPayment = await database.get(`
            SELECT id, status
            FROM payments
            WHERE booking_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [bookingId]);

        if (existingPayment && existingPayment.status === PAYMENT_STATUS.SUCCESS) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Payment already completed for this booking'
            });
        }

        // Generate transaction ID
        const transactionId = generateTransactionId();

        // Create payment record
        const paymentResult = await database.run(`
            INSERT INTO payments (booking_id, transaction_id, amount, payment_method, status)
            VALUES (?, ?, ?, ?, ?)
        `, [bookingId, transactionId, booking.total_amount, paymentMethod, PAYMENT_STATUS.PENDING]);

        // Simulate payment gateway URL (in real app, this would be actual payment gateway)
        const paymentUrl = `https://payment-gateway.com/pay/${transactionId}`;

        res.status(HTTP_STATUS.OK).json({
            success: true,
            transactionId: transactionId,
            amount: booking.total_amount,
            paymentUrl: paymentUrl,
            paymentId: paymentResult.id
        });
    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Confirm payment (webhook simulation)
const confirmPayment = async (req, res) => {
    try {
        const { transactionId, status } = req.body;

        if (!transactionId || !status) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Transaction ID and status are required'
            });
        }

        // Find payment by transaction ID
        const payment = await database.get(`
            SELECT id, booking_id, amount, status
            FROM payments
            WHERE transaction_id = ?
        `, [transactionId]);

        if (!payment) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== PAYMENT_STATUS.PENDING) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Payment is not in pending status'
            });
        }

        // Update payment status
        const paymentDate = status === PAYMENT_STATUS.SUCCESS ? new Date().toISOString() : null;
        
        await database.run(`
            UPDATE payments 
            SET status = ?, payment_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, paymentDate, payment.id]);

        // If payment is successful, update booking status
        if (status === PAYMENT_STATUS.SUCCESS) {
            await database.run(`
                UPDATE bookings 
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [BOOKING_STATUS.CONFIRMED, payment.booking_id]);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Payment ${status}`,
            transactionId: transactionId,
            bookingId: payment.booking_id
        });
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Get payment status for a booking
const getPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Check if booking exists and belongs to user
        const booking = await database.get(`
            SELECT id, total_amount, status
            FROM bookings
            WHERE id = ? AND user_id = ?
        `, [bookingId, req.user.id]);

        if (!booking) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.BOOKING_NOT_FOUND
            });
        }

        // Get latest payment for the booking
        const payment = await database.get(`
            SELECT 
                transaction_id,
                amount,
                payment_method,
                status,
                payment_date,
                created_at
            FROM payments
            WHERE booking_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [bookingId]);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            booking: {
                id: booking.id,
                totalAmount: booking.total_amount,
                status: booking.status
            },
            payment: payment ? {
                transactionId: payment.transaction_id,
                amount: payment.amount,
                paymentMethod: payment.payment_method,
                status: payment.status,
                paymentDate: payment.payment_date,
                createdAt: payment.created_at
            } : null
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

module.exports = {
    initiatePayment,
    confirmPayment,
    getPaymentStatus
}; 