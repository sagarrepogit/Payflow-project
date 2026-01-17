// ============================================================================
// AUTHENTICATION ROUTES - Define API endpoints for user authentication
// ============================================================================
// 
// WHAT ARE ROUTES?
// Routes map HTTP requests (GET, POST, etc.) to functions (controllers)
// Example: POST /api/auth/signup triggers signup() function
// Routes define WHAT the API can do (signup, login, etc.)

// WHY EXPRESS.ROUTER()?
// Router creates isolated router instance (separate from main app)
// Allows grouping related routes together
// Can be mounted on app with a prefix (like /api/auth)
// More organized than defining all routes in server.js
const express = require('express');
const router = express.Router();

// WHY IMPORT CONTROLLERS?
// Controllers contain the logic for handling requests
// Routes just connect URLs to controller functions
// Separation of concerns: routes = routing, controllers = business logic
const { signup, login, verifyOTP, getCurrentUser } = require('../controllers/authController.js');

// WHY IMPORT AUTHENTICATE MIDDLEWARE?
// authenticate middleware verifies JWT tokens
// Used to protect routes - only authenticated users can access
// Runs before controller, checks if user is logged in
const { authenticate } = require('../middleware/auth.js');

// ============================================================================
// PUBLIC ROUTES - No authentication required
// ============================================================================
// Anyone can access these endpoints (signup, login)
// These are the entry points for users to get into the system

// WHY POST FOR SIGNUP?
// POST is for creating new resources (new user account)
// GET is for reading data, POST is for creating/updating
// 
// WHY /signup PATH?
// Clear, descriptive path - immediately obvious what it does
// RESTful naming: verbs (signup, login) for actions
// 
// HOW IT WORKS:
// Client sends: POST /api/auth/signup with { FullName, Email, Password, ConfirmPassword }
// Express matches URL to this route
// Calls signup() controller function
// Controller processes request and sends response
router.post('/signup', signup);

// WHY POST FOR LOGIN?
// Login is an action that changes state (creates session/token)
// POST is appropriate for actions that have side effects
// GET requests should be idempotent (no side effects)
// 
// LOGIN FLOW:
// Step 1: User provides Email + Password
// System verifies credentials and generates OTP
// Returns OTP to user (for testing - in production, send via email)
router.post('/login', login);

// WHY SEPARATE VERIFY-OTP ENDPOINT?
// Two-step authentication process for security
// Separates credential verification from OTP verification
// Allows resending OTP without re-entering password
// 
// VERIFY OTP FLOW:
// Step 2: User provides Email + Password (re-verify) + OTP
// System validates OTP matches, is unused, and not expired
// Returns JWT token for authenticated access
router.post('/verify-otp', verifyOTP);

// ============================================================================
// PROTECTED ROUTE - Requires authentication
// ============================================================================

// WHY AUTHENTICATE MIDDLEWARE IN ROUTE?
// authenticate runs BEFORE getCurrentUser controller
// If token is invalid, authenticate sends error response and stops execution
// If token is valid, authenticate attaches user to req.user, then calls next()
// This pattern protects routes - unauthenticated users can't access
// 
// HOW MIDDLEWARE WORKS:
// 1. Request comes in: GET /api/auth/me with Authorization: Bearer <token>
// 2. authenticate middleware runs first
//    - Extracts token from header
//    - Verifies token signature and expiration
//    - Fetches user from database
//    - Attaches user to req.user
//    - Calls next() to continue to controller
// 3. getCurrentUser controller runs
//    - Uses req.user (already set by middleware)
//    - Returns user data
// 
// WHY GET FOR /me?
// GET is for reading data (getting current user info)
// /me is common convention for "current user" endpoint
// Returns logged-in user's profile information
router.get('/me', authenticate, getCurrentUser);

// Export router to be mounted in main server file
// Routes will be accessible at /api/auth/* (as defined in server.js)
module.exports = router;
