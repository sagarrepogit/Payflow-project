// ============================================================================
// AUTHENTICATION MIDDLEWARE - JWT Token Generation and Verification
// ============================================================================
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

// WHY IMPORT USER MODEL?
// Need to fetch user data after verifying token
// Token contains userId, but we need full user object
// Verifies user still exists (might have been deleted)
const User = require('../models/user.js');

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
 * WHY USERID SPECIFICALLY?
 * - Unique identifier for user
 * - Small (MongoDB ObjectId is 24 characters)
 * - Immutable (doesn't change like email or name)
 * - Enough to identify user for database lookup
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

        // Fetch user from database to ensure user still exists
        // Even if token is valid, user might have been deleted/deactivated
        // Explicitly exclude password from query (security)
        const user = await User.findById(decoded.userId).select('-Password');

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
