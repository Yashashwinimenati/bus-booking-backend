const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = ERROR_MESSAGES.INVALID_INPUT;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = err.message;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = ERROR_MESSAGES.INVALID_TOKEN;
    } else if (err.code === 'SQLITE_CONSTRAINT') {
        statusCode = HTTP_STATUS.CONFLICT;
        message = 'Data constraint violation';
    } else if (err.message) {
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 handler
const notFound = (req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};

module.exports = {
    errorHandler,
    notFound
}; 