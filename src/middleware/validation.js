const Joi = require('joi');
const { HTTP_STATUS, ERROR_MESSAGES, VALIDATION_RULES } = require('../utils/constants');

// Validation schemas
const registerSchema = Joi.object({
    fullName: Joi.string()
        .min(VALIDATION_RULES.NAME_MIN_LENGTH)
        .max(VALIDATION_RULES.NAME_MAX_LENGTH)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 100 characters',
            'any.required': 'Full name is required'
        }),
    email: Joi.string()
        .email()
        .max(VALIDATION_RULES.EMAIL_MAX_LENGTH)
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),
    phone: Joi.string()
        .min(VALIDATION_RULES.PHONE_MIN_LENGTH)
        .required()
        .messages({
            'string.min': 'Phone number must be at least 10 digits',
            'any.required': 'Phone number is required'
        })
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

const busSearchSchema = Joi.object({
    source: Joi.string().required().messages({
        'any.required': 'Source city is required'
    }),
    destination: Joi.string().required().messages({
        'any.required': 'Destination city is required'
    }),
    travelDate: Joi.date().iso().required().messages({
        'date.format': 'Travel date must be in YYYY-MM-DD format',
        'any.required': 'Travel date is required'
    }),
    busType: Joi.string().optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    departureTime: Joi.string().valid('morning', 'afternoon', 'evening', 'night').optional()
});

const createBookingSchema = Joi.object({
    scheduleId: Joi.number().integer().positive().required().messages({
        'any.required': 'Schedule ID is required'
    }),
    travelDate: Joi.date().iso().required().messages({
        'date.format': 'Travel date must be in YYYY-MM-DD format',
        'any.required': 'Travel date is required'
    }),
    boardingPoint: Joi.string().required().messages({
        'any.required': 'Boarding point is required'
    }),
    droppingPoint: Joi.string().required().messages({
        'any.required': 'Dropping point is required'
    }),
    passengers: Joi.array().items(
        Joi.object({
            name: Joi.string().min(2).max(100).required(),
            age: Joi.number().integer().min(1).max(120).required(),
            gender: Joi.string().valid('Male', 'Female', 'Other').required(),
            seatNumber: Joi.string().required()
        })
    ).min(1).required().messages({
        'array.min': 'At least one passenger is required',
        'any.required': 'Passengers information is required'
    })
});

const paymentSchema = Joi.object({
    bookingId: Joi.number().integer().positive().required().messages({
        'any.required': 'Booking ID is required'
    }),
    paymentMethod: Joi.string().valid('card', 'upi', 'net_banking', 'wallet').required().messages({
        'any.required': 'Payment method is required'
    })
});

const updateProfileSchema = Joi.object({
    fullName: Joi.string()
        .min(VALIDATION_RULES.NAME_MIN_LENGTH)
        .max(VALIDATION_RULES.NAME_MAX_LENGTH)
        .optional(),
    phone: Joi.string()
        .min(VALIDATION_RULES.PHONE_MIN_LENGTH)
        .optional()
});

// Validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            const errorMessage = error.details[0].message;
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: errorMessage
            });
        }
        
        next();
    };
};

// Query validation middleware
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        
        if (error) {
            const errorMessage = error.details[0].message;
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: errorMessage
            });
        }
        
        next();
    };
};

module.exports = {
    validate,
    validateQuery,
    registerSchema,
    loginSchema,
    busSearchSchema,
    createBookingSchema,
    paymentSchema,
    updateProfileSchema
}; 