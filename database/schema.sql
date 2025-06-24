-- Bus Booking System Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bus Operators table
CREATE TABLE IF NOT EXISTS bus_operators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    operator_id INTEGER NOT NULL,
    bus_type VARCHAR(50) NOT NULL, -- AC, Non-AC, Sleeper, Semi-Sleeper, Volvo
    total_seats INTEGER NOT NULL,
    amenities TEXT, -- JSON string of amenities
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES bus_operators(id)
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    distance_km INTEGER,
    estimated_duration_hours INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bus Schedules table
CREATE TABLE IF NOT EXISTS bus_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    FOREIGN KEY (route_id) REFERENCES routes(id)
);

-- Boarding Points table
CREATE TABLE IF NOT EXISTS boarding_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    pickup_time TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES bus_schedules(id)
);

-- Dropping Points table
CREATE TABLE IF NOT EXISTS dropping_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    drop_time TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES bus_schedules(id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    schedule_id INTEGER NOT NULL,
    travel_date DATE NOT NULL,
    boarding_point VARCHAR(100) NOT NULL,
    dropping_point VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (schedule_id) REFERENCES bus_schedules(id)
);

-- Passengers table
CREATE TABLE IF NOT EXISTS passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, success, failed
    payment_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_buses_operator ON buses(operator_id);
CREATE INDEX IF NOT EXISTS idx_schedules_bus_route ON bus_schedules(bus_id, route_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule_date ON bookings(schedule_id, travel_date);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_passengers_booking ON passengers(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id); 