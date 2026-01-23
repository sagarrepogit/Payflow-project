// ============================================================================
// AUTHENTICATION MIDDLEWARE - JWT Token Generation and Verification
// ============================================================================
// 
// MIGRATION FROM MONGODB TO MYSQL:
// - Replaced User.findById() with findUserById() SQL query function
// - Changed user._id to user.id (MySQL uses integer ID, not ObjectId)
// - JWT tokens now store integer userId instead of ObjectId string
// 
// WHAT IS MIDDLEWARE?
// Middleware functions run between receiving request and sending response
// They can modify request, end request-response cycle, or call next middleware
// Authentication middleware protects routes by verifying tokens
// 
// WHY JWT (JSON Web Token)?
// JWT is a standard way to securely transmit information between parties
// Contains encoded user info (like userId) that can be verified
// Self-contained: all info needed is in the token itself
// Stateless: server doesn't need to store sessions (scales better)

// WHY JWT LIBRARY?
// jsonwebtoken library handles JWT creation and verification
// Provides secure signing/verification using secret keys
// Handles token expiration automatically
// Industry standard for JWT in Node.js
const jwt = require('jsonwebtoken');

// WHY IMPORT ENV?
// Need JWT_SECRET to sign and verify tokens
// Secret must be same for signing and verifying (symmetric encryption)
// Stored in environment variables for security
const { env } = require('../config/env.js');

// MIGRATION NOTE:
// Old: const User = require('../models/user.js'); // Mongoose model
// New: Import SQL query function instead of Mongoose model
const { findUserById } = require('../models/user.js');

/**
 * Generate JWT Token
 * 
 * WHAT DOES THIS FUNCTION DO?
 * Creates a JSON Web Token containing user ID
 * Token proves user is authenticated without storing sessions
 * 
 * WHY JWT TOKENS?
 * - Stateless: No server-side session storage needed (each request is independent)
 * - Scalable: Tokens work across multiple servers (no shared session storage)
 * - Performance: Contains user info, reducing database lookups
 * - Standard: Industry standard for REST APIs (widely supported)
 * - Secure: Cryptographically signed, can't be tampered with
 * 
 * TOKEN STRUCTURE:
 * Header.Payload.Signature
 * - Header: Algorithm and token type
 * - Payload: Data (userId in our case)
 * - Signature: Ensures token wasn't modified
 * 
 * WHY STORE ONLY USERID IN TOKEN?
 * - Minimizes token size (smaller = faster transmission)
 * - Security: Less sensitive data in token (tokens can be intercepted)
 * - Fresh data: Fetch user data from database when needed (always up-to-date)
 * - Flexibility: User info changes don't invalidate old tokens
 * 
 * MIGRATION NOTE:
 * - Old: userId was MongoDB ObjectId (24-char string like "507f1f77bcf86cd799439011")
 * - New: userId is MySQL integer (1, 2, 3, ...)
 * - JWT payload still contains userId, but now it's an integer
 * 
 * HOW JWT.SIGN WORKS:
 * - Takes payload (userId), secret key, and options
 * - Creates signature using secret key
 * - Returns token string like: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * - Token can be verified later using same secret
 */
const generateToken = (userId) => {
    // WHY JWT.SIGN()?
    // jwt.sign() creates and signs the token
    // { userId } is the payload (data stored in token)
    // env.JWT_SECRET is the secret key for signing (must be kept secret!)
    // { expiresIn } sets when token becomes invalid
    // 
    // MIGRATION NOTE:
    // userId is now an integer (MySQL ID) instead of ObjectId string
    return jwt.sign({ userId }, env.JWT_SECRET, {
        // WHY EXPIRATION?
        // Tokens expire to limit damage if compromised
        // If token is stolen, attacker only has access until expiration
        // Forces users to re-authenticate periodically (security best practice)
        // env.JWT_EXPIRE might be "7d" (7 days) or "24h" (24 hours)
        expiresIn: env.JWT_EXPIRE // Token expiration prevents indefinite access if compromised
    });
};

/**
 * Verify JWT Token and authenticate user
 * 
 * Middleware pattern: runs before route handlers
 * Protects routes by verifying token and loading user data
 * Attaches authenticated user to req.user for use in controllers
 */
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        // Format: "Bearer <token>" - industry standard for API authentication
        // Using optional chaining (?.) prevents errors if header is undefined
        const token = req.headers.authorization?.replace('Bearer ', '');

        // Fail fast if no token provided
        // 401 Unauthorized = missing/invalid credentials
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token signature and expiration using secret
        // This ensures token wasn't tampered with and hasn't expired
        // Throws error if invalid/expired, caught in catch block
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // MIGRATION NOTE:
        // Old: await User.findById(decoded.userId).select('-Password')
        // New: await findUserById(decoded.userId) // Password excluded by default
        // 
        // decoded.userId is now an integer (MySQL ID) instead of ObjectId string
        // 
        // Fetch user from database to ensure user still exists
        // Even if token is valid, user might have been deleted/deactivated
        // Password is excluded by default in findUserById() (security)
        const user = await findUserById(decoded.userId);

        // If user doesn't exist, token is invalid (user was deleted)
        // Prevents access with tokens for deleted accounts
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        // Attach user object to request for use in route handlers
        // Controllers can access authenticated user via req.user
        // MIGRATION NOTE: user.id is now the primary identifier (not user._id)
        req.user = user;
        next(); // Continue to next middleware/route handler
    } catch (error) {
        // Handle specific JWT error types with appropriate messages
        // JsonWebTokenError = malformed token, wrong secret, etc.
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        // TokenExpiredError = token was valid but expired
        // User needs to login again to get fresh token
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        // Catch any other unexpected errors
        // Return 500 to indicate server-side issue
        res.status(500).json({
            success: false,
            message: 'Authentication failed.',
            error: error.message
        });
    }
};

module.exports = {
    generateToken,
    authenticate
};
