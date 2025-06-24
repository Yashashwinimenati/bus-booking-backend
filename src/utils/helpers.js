const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Password hashing
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Password verification
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// JWT token generation
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// JWT token verification
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Generate booking reference
const generateBookingReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BK${timestamp}${random}`;
};

// Generate transaction ID
const generateTransactionId = () => {
    return `TXN${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;
};

// Calculate duration between two times
const calculateDuration = (departureTime, arrivalTime) => {
    const [depHour, depMin] = departureTime.split(':').map(Number);
    const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
    
    let duration = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
    if (duration < 0) duration += 24 * 60; // Next day
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
};

// Format time for display
const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
};

// Parse amenities JSON string
const parseAmenities = (amenitiesString) => {
    try {
        return JSON.parse(amenitiesString);
    } catch (error) {
        return [];
    }
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number format
const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};

// Sanitize input
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

// Generate seat layout for different bus types
const generateSeatLayout = (busType, totalSeats) => {
    const layout = {
        lower: [],
        upper: []
    };
    
    if (busType.toLowerCase().includes('sleeper')) {
        // Sleeper bus layout
        const seatsPerRow = 2;
        const rows = Math.ceil(totalSeats / seatsPerRow);
        
        for (let i = 1; i <= rows; i++) {
            layout.lower.push(`L${i}`);
            if (layout.upper.length < totalSeats - rows) {
                layout.upper.push(`U${i}`);
            }
        }
    } else {
        // Seater bus layout
        const seatsPerRow = 4;
        const rows = Math.ceil(totalSeats / seatsPerRow);
        
        for (let i = 1; i <= rows; i++) {
            for (let j = 1; j <= seatsPerRow && layout.lower.length < totalSeats; j++) {
                layout.lower.push(`${i}${j}`);
            }
        }
    }
    
    return layout;
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    generateBookingReference,
    generateTransactionId,
    calculateDuration,
    formatTime,
    parseAmenities,
    isValidEmail,
    isValidPhone,
    sanitizeInput,
    generateSeatLayout
}; 