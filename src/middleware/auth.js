const { verifyToken } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_TOKEN
        });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_TOKEN
        });
    }
};

const authorizeUser = (req, res, next) => {
    const { userId } = req.params;
    
    if (req.user.id != userId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
        });
    }
    
    next();
};

module.exports = {
    authenticateToken,
    authorizeUser
}; 