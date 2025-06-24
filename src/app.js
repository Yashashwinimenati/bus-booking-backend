const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const database = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Bus Booking API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT. Closing server gracefully...');
    await database.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Closing server gracefully...');
    await database.disconnect();
    process.exit(0);
});

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await database.connect();
        console.log('Database connected successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚌 Bus Booking API server is running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

module.exports = app; 