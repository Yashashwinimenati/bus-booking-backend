# Bus Booking System - Backend API

A complete backend API for a bus booking system similar to RedBus, built with Node.js, Express.js, and SQLite.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **Bus Search**: Search for available buses with multiple filters
- **Seat Management**: Real-time seat availability and booking
- **Booking System**: Create, view, and cancel bookings
- **Payment Integration**: Payment initiation and confirmation
- **Security**: Password hashing, input validation, rate limiting
- **Database**: SQLite with proper schema design and relationships

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bus-booking-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config.env .env
   # Edit .env file with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## 🗄️ Database Design

### Core Entities

1. **Users**: Store user information for authentication
2. **Bus Operators**: Companies that own and operate buses
3. **Buses**: Individual buses with specifications and amenities
4. **Routes**: Source and destination cities with distance and duration
5. **Bus Schedules**: When and where buses operate with pricing
6. **Bookings**: User bookings with all relevant details
7. **Passengers**: Individual passenger information for each booking
8. **Payments**: Payment transactions and their status

### Key Features

- **Prevents Double Booking**: Seat validation ensures no two users can book the same seat
- **Transaction Integrity**: Database transactions for critical operations
- **Proper Indexing**: Optimized queries with appropriate indexes
- **Audit Fields**: Created and updated timestamps for all entities

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### 1. Authentication APIs

#### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "phone": "+1234567890"
}
```

**Response:**
```json
{
    "success": true,
    "message": "User registered successfully",
    "userId": 1
}
```

#### POST /api/auth/login
User login

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "securePassword123"
}
```

**Response:**
```json
{
    "success": true,
    "token": "jwt_token_here",
    "user": {
        "id": 1,
        "fullName": "John Doe",
        "email": "john@example.com"
    }
}
```

#### GET /api/auth/profile
Get user profile (requires authentication)

#### PUT /api/auth/profile
Update user profile (requires authentication)

### 2. Bus Search APIs

#### GET /api/buses/search
Search for available buses

**Query Parameters:**
- `source` (required): Source city
- `destination` (required): Destination city
- `travelDate` (required): Travel date (YYYY-MM-DD)
- `busType` (optional): Filter by bus type
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `departureTime` (optional): morning/afternoon/evening/night

**Example:**
```
GET /api/buses/search?source=Bangalore&destination=Mumbai&travelDate=2024-03-15&busType=AC Sleeper
```

**Response:**
```json
{
    "success": true,
    "count": 2,
    "buses": [
        {
            "scheduleId": 1,
            "busNumber": "KA01AB1234",
            "operatorName": "ABC Travels",
            "busType": "AC Sleeper",
            "departureTime": "10:00 PM",
            "arrivalTime": "4:00 PM",
            "duration": "18h",
            "price": 800,
            "availableSeats": 20,
            "totalSeats": 40,
            "rating": 4.2,
            "amenities": ["WiFi", "Charging Point", "Blanket"],
            "boardingPoints": [...],
            "droppingPoints": [...]
        }
    ]
}
```

#### GET /api/buses/:scheduleId/seats
Get seat layout and availability

**Query Parameters:**
- `travelDate` (required): Travel date

**Response:**
```json
{
    "success": true,
    "busType": "sleeper",
    "seatLayout": {
        "lower": ["L1", "L2", "L3", ...],
        "upper": ["U1", "U2", "U3", ...]
    },
    "bookedSeats": ["L1", "L5", "U10"],
    "totalSeats": 40,
    "availableSeats": 37
}
```

### 3. Booking APIs

#### POST /api/bookings/create
Create a new booking (requires authentication)

**Request Body:**
```json
{
    "scheduleId": 1,
    "travelDate": "2024-03-15",
    "boardingPoint": "Majestic Bus Stand",
    "droppingPoint": "Central Bus Stand",
    "passengers": [
        {
            "name": "John Doe",
            "age": 25,
            "gender": "Male",
            "seatNumber": "L12"
        }
    ]
}
```

**Response:**
```json
{
    "success": true,
    "bookingReference": "BK123456",
    "totalAmount": 800,
    "bookingId": 1
}
```

#### GET /api/bookings
Get user's booking history (requires authentication)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by booking status

#### GET /api/bookings/:bookingId
Get booking details (requires authentication)

#### POST /api/bookings/:bookingId/cancel
Cancel a booking (requires authentication)

### 4. Payment APIs

#### POST /api/payments/initiate
Initiate payment for a booking (requires authentication)

**Request Body:**
```json
{
    "bookingId": 1,
    "paymentMethod": "card"
}
```

**Response:**
```json
{
    "success": true,
    "transactionId": "TXN123456",
    "amount": 800,
    "paymentUrl": "payment_gateway_url"
}
```

#### POST /api/payments/confirm
Confirm payment (webhook simulation)

**Request Body:**
```json
{
    "transactionId": "TXN123456",
    "status": "success"
}
```

#### GET /api/payments/:bookingId/status
Get payment status for a booking (requires authentication)

## 🧪 Testing the API

### Using cURL

1. **Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

3. **Search buses:**
```bash
curl "http://localhost:3000/api/buses/search?source=Bangalore&destination=Mumbai&travelDate=2024-03-15"
```

4. **Create booking (with token):**
```bash
curl -X POST http://localhost:3000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "scheduleId": 1,
    "travelDate": "2024-03-15",
    "boardingPoint": "Majestic Bus Stand",
    "droppingPoint": "Central Bus Stand",
    "passengers": [
      {
        "name": "John Doe",
        "age": 25,
        "gender": "Male",
        "seatNumber": "L12"
      }
    ]
  }'
```

### Using Postman

Import the provided Postman collection for easy testing of all endpoints.

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=development
DB_PATH=./database/bus_booking.db
```

## 📁 Project Structure

```
bus-booking-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   │   ├── authController.js    # Authentication logic
│   │   ├── busController.js     # Bus search logic
│   │   ├── bookingController.js # Booking management
│   │   └── paymentController.js # Payment processing
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Input validation
│   │   └── errorHandler.js      # Error handling
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── busRoutes.js         # Bus search routes
│   │   ├── bookingRoutes.js     # Booking routes
│   │   └── paymentRoutes.js     # Payment routes
│   ├── utils/
│   │   ├── helpers.js           # Utility functions
│   │   └── constants.js         # Application constants
│   └── app.js                   # Main application file
├── database/
│   ├── schema.sql               # Database schema
│   ├── seeds.sql                # Sample data
│   └── init.js                  # Database initialization
├── config.env                   # Environment configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```bash
docker build -t bus-booking-api .
docker run -p 3000:3000 bus-booking-api
```

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Joi schema validation for all inputs
- **Rate Limiting**: Prevents abuse with request limiting
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express.js
- **SQL Injection Prevention**: Parameterized queries

## 🐛 Error Handling

The API returns consistent error responses:

```json
{
    "success": false,
    "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 📊 Sample Data

The database comes pre-populated with:
- 4 bus operators
- 6 routes between major cities
- 6 buses with different types
- 6 bus schedules
- Boarding and dropping points

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Happy Coding! 🚌✨** 