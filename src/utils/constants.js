// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

// Booking Status
const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled'
};

// Payment Status
const PAYMENT_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed'
};

// Payment Methods
const PAYMENT_METHODS = {
    CARD: 'card',
    UPI: 'upi',
    NET_BANKING: 'net_banking',
    WALLET: 'wallet'
};

// Bus Types
const BUS_TYPES = {
    AC_SLEEPER: 'AC Sleeper',
    NON_AC_SLEEPER: 'Non-AC Sleeper',
    AC_VOLVO: 'AC Volvo',
    AC_SEMI_SLEEPER: 'AC Semi-Sleeper',
    NON_AC_SEATER: 'Non-AC Seater'
};

// Time Slots
const TIME_SLOTS = {
    MORNING: 'morning',
    AFTERNOON: 'afternoon',
    EVENING: 'evening',
    NIGHT: 'night'
};

// Error Messages
const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    INVALID_TOKEN: 'Invalid or expired token',
    UNAUTHORIZED_ACCESS: 'Unauthorized access',
    RESOURCE_NOT_FOUND: 'Resource not found',
    SEAT_ALREADY_BOOKED: 'Seat is already booked',
    INVALID_INPUT: 'Invalid input data',
    BOOKING_NOT_FOUND: 'Booking not found',
    PAYMENT_FAILED: 'Payment failed',
    INSUFFICIENT_SEATS: 'Insufficient seats available'
};

// Success Messages
const SUCCESS_MESSAGES = {
    USER_REGISTERED: 'User registered successfully',
    USER_LOGGED_IN: 'User logged in successfully',
    USER_LOGGED_OUT: 'User logged out successfully',
    BOOKING_CREATED: 'Booking created successfully',
    BOOKING_CANCELLED: 'Booking cancelled successfully',
    PAYMENT_SUCCESS: 'Payment successful',
    PROFILE_UPDATED: 'Profile updated successfully'
};

// Validation Rules
const VALIDATION_RULES = {
    PASSWORD_MIN_LENGTH: 6,
    PHONE_MIN_LENGTH: 10,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 100
};

// Pagination
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

module.exports = {
    HTTP_STATUS,
    BOOKING_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    BUS_TYPES,
    TIME_SLOTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    VALIDATION_RULES,
    PAGINATION
}; 