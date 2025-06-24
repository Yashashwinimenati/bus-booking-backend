-- Seed data for Bus Booking System

-- Insert sample bus operators
INSERT INTO bus_operators (name, contact_number, email, address, rating) VALUES
('ABC Travels', '+91-9876543210', 'info@abctravels.com', '123 Main Street, Bangalore', 4.2),
('XYZ Bus Services', '+91-9876543211', 'contact@xyzbus.com', '456 Park Avenue, Mumbai', 4.5),
('Royal Express', '+91-9876543212', 'support@royalexpress.com', '789 Central Road, Delhi', 4.0),
('Comfort Travels', '+91-9876543213', 'hello@comforttravels.com', '321 Lake View, Chennai', 4.3);

-- Insert sample routes
INSERT INTO routes (source_city, destination_city, distance_km, estimated_duration_hours) VALUES
('Bangalore', 'Mumbai', 1000, 18),
('Mumbai', 'Delhi', 1400, 24),
('Delhi', 'Chennai', 2200, 36),
('Chennai', 'Bangalore', 350, 8),
('Bangalore', 'Delhi', 2000, 32),
('Mumbai', 'Chennai', 1300, 22);

-- Insert sample buses
INSERT INTO buses (bus_number, operator_id, bus_type, total_seats, amenities) VALUES
('KA01AB1234', 1, 'AC Sleeper', 40, '["WiFi", "Charging Point", "Blanket", "Water Bottle"]'),
('KA01AB1235', 1, 'Non-AC Sleeper', 40, '["Charging Point", "Blanket"]'),
('MH01XY5678', 2, 'AC Volvo', 50, '["WiFi", "Charging Point", "Blanket", "Water Bottle", "Snacks"]'),
('MH01XY5679', 2, 'AC Semi-Sleeper', 45, '["WiFi", "Charging Point", "Blanket"]'),
('DL01RO9012', 3, 'AC Sleeper', 40, '["WiFi", "Charging Point", "Blanket", "Water Bottle"]'),
('TN01CO3456', 4, 'Non-AC Sleeper', 40, '["Charging Point", "Blanket"]');

-- Insert sample bus schedules
INSERT INTO bus_schedules (bus_id, route_id, departure_time, arrival_time, base_price) VALUES
(1, 1, '22:00', '16:00', 800.00),
(2, 1, '20:00', '14:00', 600.00),
(3, 2, '18:00', '18:00', 1200.00),
(4, 2, '16:00', '16:00', 1000.00),
(5, 3, '20:00', '08:00', 1500.00),
(6, 4, '08:00', '16:00', 400.00);

-- Insert sample boarding points
INSERT INTO boarding_points (schedule_id, location_name, pickup_time) VALUES
(1, 'Majestic Bus Stand', '21:30'),
(1, 'Electronic City', '22:30'),
(2, 'Majestic Bus Stand', '19:30'),
(3, 'Mumbai Central', '17:30'),
(4, 'Mumbai Central', '15:30'),
(5, 'ISBT Kashmere Gate', '19:30'),
(6, 'CMBT Chennai', '07:30');

-- Insert sample dropping points
INSERT INTO dropping_points (schedule_id, location_name, drop_time) VALUES
(1, 'Mumbai Central', '15:30'),
(1, 'Bandra Terminus', '16:30'),
(2, 'Mumbai Central', '13:30'),
(3, 'ISBT Kashmere Gate', '17:30'),
(4, 'ISBT Kashmere Gate', '15:30'),
(5, 'CMBT Chennai', '07:30'),
(6, 'Majestic Bus Stand', '15:30'); 