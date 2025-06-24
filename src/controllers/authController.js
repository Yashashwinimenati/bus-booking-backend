const database = require('../config/database');
const { hashPassword, verifyPassword, generateToken, isValidEmail, isValidPhone } = require('../utils/helpers');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');

// Register user
const register = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate phone format
        if (!isValidPhone(phone)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Please provide a valid phone number'
            });
        }

        // Check if user already exists
        const existingUser = await database.get(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
            });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Insert new user
        const result = await database.run(
            'INSERT INTO users (full_name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
            [fullName, email, passwordHash, phone]
        );

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_REGISTERED,
            userId: result.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await database.get(
            'SELECT id, full_name, email, password_hash FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Generate token
        const token = generateToken({
            id: user.id,
            email: user.email,
            fullName: user.full_name
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_LOGGED_IN,
            token: token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return a success message
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_LOGGED_OUT
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await database.get(
            'SELECT id, full_name, email, phone, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone } = req.body;

        // Validate phone format if provided
        if (phone && !isValidPhone(phone)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Please provide a valid phone number'
            });
        }

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (fullName) {
            updateFields.push('full_name = ?');
            updateValues.push(fullName);
        }

        if (phone) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }

        if (updateFields.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(userId);

        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        
        const result = await database.run(query, updateValues);

        if (result.changes === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.PROFILE_UPDATED
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile
}; 