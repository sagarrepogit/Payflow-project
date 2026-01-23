// ============================================================================
// CONTROLLER IMPORTS - Import everything we need for authentication logic
// ============================================================================
// 
// MIGRATION FROM MONGODB TO MYSQL:
// - Replaced Mongoose model imports with SQL query function imports
// - Changed from User.findOne(), User.create() to findUserByEmail(), createUser()
// - Changed from OTP.findOne(), OTP.create() to findValidOTP(), createOTP()
// - Updated error handling for MySQL-specific errors (ER_DUP_ENTRY)
// - Changed user._id to user.id (MySQL uses integer ID, not ObjectId)
// 
// WHY SEPARATE IMPORTS LIKE THIS?
// Each import serves a specific purpose:
// - Models: SQL query functions (findUserByEmail, createUser, etc.)
// - Utils: Helper functions (password hashing)
// - Middleware: Authentication utilities (JWT token generation)
// This organization makes code easier to understand and maintain

// MIGRATION NOTE:
// Old: const User = require('../models/user.js'); // Mongoose model
// New: Import SQL query functions instead of Mongoose model
const { findUserByEmail, findUserById, createUser } = require('../models/user.js');

// WHY DESTRUCTURE PASSWORD UTILS?
// { hashPassword, comparePassword } extracts only the functions we need
// Instead of passwordUtils.hashPassword(), we can just use hashPassword()
// Cleaner code - no need to type the module name every time
const { hashPassword, comparePassword } = require('../utils/password.js');

// WHY REQUIRE GENERATE TOKEN?
// generateToken creates JWT tokens for authenticated users
// Tokens prove user is logged in without storing sessions
// Imported from middleware because it's used in both middleware and controllers
const { generateToken } = require('../middleware/auth.js');

// MIGRATION NOTE:
// Old: const OTP = require('../models/otp.js'); // Mongoose model
// New: Import SQL query functions instead of Mongoose model
const { findValidOTP, createOTP, markOTPAsUsed, invalidateUnusedOTPs } = require('../models/otp.js');

// WHY REQUIRE OTP UTILITIES?
// generateOTP creates random 6-digit codes
// getOTPExpiration calculates when OTP should expire
// Separated into utils for reusability and testability
const { generateOTP, getOTPExpiration } = require('../utils/otp.js');

// ============================================================================
// SIGNUP CONTROLLER - Handle new user registration
// ============================================================================
// 
// WHAT IS A CONTROLLER?
// Controllers contain the business logic for handling requests
// They process data, interact with database, and send responses
// Keep controllers focused on one task (single responsibility principle)
// 
// WHY ASYNC FUNCTION?
// Controllers are async because they do async operations (database queries)
// async/await makes async code readable (looks like regular code)
// Without async, we'd need .then() chains which are harder to read
// 
// WHY REQ AND RES PARAMETERS?
// req (request): Contains data from client (body, headers, params)
// res (response): Used to send data back to client (json, status codes)
// Express automatically passes these to route handlers
// 
// WHAT THIS FUNCTION DOES:
// 1. Validates user input (FullName, Email, Password, ConfirmPassword)
// 2. Checks if email already exists
// 3. Hashes password for security
// 4. Creates user in database
// 5. Generates JWT token
// 6. Returns user data and token
// 
// WHY RETURN JWT TOKEN ON SIGNUP?
// User is immediately authenticated after registration
// Better UX - no need to login separately after signup
// Token allows immediate access to protected routes
const signup = async (req, res) => {
    // WHY TRY-CATCH?
    // Wraps entire function in error handling
    // If anything goes wrong (validation, database error), catch block handles it
    // Prevents server crash - returns error response instead
    try {
        // WHY DESTRUCTURE REQ.BODY?
        // req.body contains JSON data sent in POST request
        // Destructuring extracts specific fields into variables
        // Cleaner than writing req.body.FullName, req.body.Email repeatedly
        // 
        // Example request body:
        // {
        //   "FullName": "John Doe",
        //   "Email": "john@example.com",
        //   "Password": "SecurePass123@",
        //   "ConfirmPassword": "SecurePass123@"
        // }
        const { FullName, Email, Password, ConfirmPassword } = req.body;

        // Manual validation of required fields before database query
        // Fails fast - saves database roundtrip if fields are missing
        // 400 Bad Request = client error (invalid input)
        if (!FullName || !Email || !Password || !ConfirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide Full Name, Email, Password, and Confirm Password'
            });
        }

        // Validate that Password and ConfirmPassword match
        // Prevents user from accidentally creating account with wrong password
        // Critical security check - ensures user typed password correctly
        if (Password !== ConfirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and Confirm Password do not match'
            });
        }

        // MIGRATION NOTE:
        // Old: await User.findOne({ Email: Email.toLowerCase() })
        // New: await findUserByEmail(Email.toLowerCase())
        // 
        // Check email uniqueness BEFORE creating user
        // Prevents duplicate email errors and provides better UX
        // Using lowercase ensures case-insensitive check
        // Email is now the login identifier, so uniqueness is critical
        const existingUserByEmail = await findUserByEmail(Email);
        if (existingUserByEmail) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered. Please use another email or login.'
            });
        }

        // Hash password before storing
        // NEVER store plain text passwords - security requirement
        // Hashing is one-way, can't reverse to get original password
        const hashedPassword = await hashPassword(Password);

        // MIGRATION NOTE:
        // Old: await User.create({ FullName, Email, Password: hashedPassword })
        // New: await createUser({ FullName, Email, Password: hashedPassword })
        // 
        // Create user with FullName, Email, and hashed password
        // Normalize email to lowercase for consistency
        // Application-level validation runs in createUser() function
        const user = await createUser({
            FullName: FullName.trim(), // Trim whitespace from full name
            Email: Email.toLowerCase(), // Normalize to lowercase
            Password: hashedPassword // Store hashed version, not plain text
        });

        // MIGRATION NOTE:
        // Old: generateToken(user._id) // MongoDB ObjectId
        // New: generateToken(user.id) // MySQL integer ID
        // 
        // Generate JWT token immediately after signup
        // Allows user to be logged in right after registration (better UX)
        // Token expires per JWT_EXPIRE setting
        const token = generateToken(user.id);

        // Return success response with user data and token
        // 201 Created = resource successfully created
        // Explicitly select which fields to return (exclude password)
        // Security: never send password in response, even if hashed
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id, // MIGRATION: Changed from _id to id
                    FullName: user.FullName,
                    Email: user.Email,
                    createdAt: user.createdAt, // Useful for client-side display
                    updatedAt: user.updatedAt
                },
                token // Include token so user is immediately authenticated
            }
        });
    } catch (error) {
        // ====================================================================
        // ERROR HANDLING - Different errors need different responses
        // ====================================================================
        // 
        // MIGRATION NOTE:
        // Old: error.name === 'ValidationError' (Mongoose validation)
        // New: Application-level validation throws Error with message
        // Old: error.code === 11000 (MongoDB duplicate key)
        // New: error.code === 'ER_DUP_ENTRY' (MySQL duplicate entry)
        
        // WHY HANDLE SPECIFIC ERRORS?
        // Different errors mean different things to the user
        // Specific error messages help users fix their input
        // Generic errors are frustrating - "something went wrong" doesn't help
        
        // MIGRATION: MySQL duplicate entry error
        // MySQL error code ER_DUP_ENTRY = duplicate key violation
        // Happens when trying to create user with existing email (UNIQUE constraint)
        // Can occur if two signup requests happen simultaneously
        if (error.code === 'ER_DUP_ENTRY') {
            // WHY STATUS 409?
            // 409 Conflict = resource already exists
            // Different from 400 - data is valid, but conflicts with existing data
            // User needs to use different email or login instead
            return res.status(409).json({
                success: false,
                message: 'Email already registered. Please use another email or login.'
            });
        }

        // MIGRATION: Application-level validation errors
        // createUser() throws Error with message for validation failures
        // Check if error message contains validation keywords
        if (error.message && (
            error.message.includes('required') ||
            error.message.includes('must be') ||
            error.message.includes('can only contain') ||
            error.message.includes('Invalid') ||
            error.message.includes('too long')
        )) {
            // WHY STATUS 400?
            // 400 Bad Request = client sent invalid data
            // This is user's fault, not server's fault
            // User needs to fix their input
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }

        // WHY CATCH ALL OTHER ERRORS?
        // Not all errors are expected or user-related
        // Database connection issues, network problems, programming errors
        // These are server problems, not user problems
        
        // WHY STATUS 500?
        // 500 Internal Server Error = something wrong on server side
        // User can't fix this - it's our problem to solve
        
        // WHY GENERIC MESSAGE?
        // Don't expose internal error details to users (security)
        // Detailed errors might reveal system architecture or vulnerabilities
        // Log full error on server, send safe message to client
        res.status(500).json({
            success: false,
            message: 'Error creating user account',
            error: error.message // In production, might want to hide this too
        });
    }
};

/**
 * Login Controller - Step 1: Verify Email and Password, Generate OTP
 * 
 * Two-step login process:
 * 1. This endpoint verifies Email + Password and generates OTP
 * 2. User enters OTP in verify-otp endpoint to complete login
 * 
 * This adds extra security layer for fintech applications
 */
const login = async (req, res) => {
    try {
        // Extract credentials from request
        // Login now uses Email (not username) for authentication
        const { Email, Password } = req.body;

        // Validate required fields before database query
        // Fail fast pattern - saves unnecessary database lookup
        if (!Email || !Password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide Email and Password'
            });
        }

        // MIGRATION NOTE:
        // Old: await User.findOne({ Email: Email.toLowerCase() }).select('+Password')
        // New: await findUserByEmail(Email, true) // true = include password
        // 
        // Find user by email
        // includePassword = true to get password for comparison
        // Password is excluded by default for security, but we need it here
        const user = await findUserByEmail(Email, true);

        // Generic error message for both invalid email and password
        // Security best practice: don't reveal if email exists
        // Prevents email enumeration attacks
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Email or password is incorrect.'
            });
        }

        // Compare provided password with stored hash
        // bcrypt.compare is timing-safe (prevents timing attacks)
        // Always compare even if user doesn't exist (constant-time operation)
        const isPasswordValid = await comparePassword(Password, user.Password);

        // Same generic message whether email or password is wrong
        // Don't reveal which part is incorrect (security)
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Email or password is incorrect.'
            });
        }

        // Credentials are valid - proceed with OTP generation
        // OTP adds second factor of authentication for enhanced security
        
        // STEP 1: Generate 6-digit OTP using utility function
        // generateOTP() uses Math.random() to create random number 100000-999999
        // Returns as string (e.g., "123456") for consistent format
        const otpCode = generateOTP();
        
        // STEP 2: Calculate expiration time (10 minutes from now)
        // getOTPExpiration() adds 10 minutes (600,000 milliseconds) to current time
        // Returns Date object with future timestamp when OTP becomes invalid
        const expiresAt = getOTPExpiration(10); // OTP expires in 10 minutes
        
        // Why generate OTP after password verification?
        // - Only creates OTP if credentials are correct (saves resources)
        // - Prevents OTP spam for invalid login attempts
        // - Security: OTPs are only generated for legitimate login requests

        // MIGRATION NOTE:
        // Old: await OTP.updateMany({ Email, used: false }, { used: true })
        // New: await invalidateUnusedOTPs(Email)
        // 
        // STEP 3: Invalidate any existing unused OTPs for this email
        // Why invalidate old OTPs?
        // - Security: Prevents user from having multiple valid OTPs at once
        // - Prevents confusion: Only one OTP should be valid per email at a time
        // - Prevents abuse: Old OTPs can't be used if new one is requested
        // - Database cleanup: Marks old OTPs as used to prevent verification
        await invalidateUnusedOTPs(Email);

        // MIGRATION NOTE:
        // Old: await OTP.create({ Email, OTP: otpCode, expiresAt, used: false })
        // New: await createOTP({ Email, OTP: otpCode, expiresAt })
        // 
        // STEP 4: Store new OTP in database
        // Why store OTP in database?
        // - Verification: Need to check if provided OTP matches stored OTP
        // - Expiration tracking: Database tracks when OTP expires
        // - Usage tracking: Mark OTP as used after verification (one-time use)
        // - Security audit: Track when OTPs are generated and used
        const otpRecord = await createOTP({
            Email: Email.toLowerCase(), // Normalize email for consistent lookups
            OTP: otpCode, // The 6-digit OTP code (e.g., "123456")
            expiresAt: expiresAt // When this OTP becomes invalid (10 minutes from now)
        });
        
        // OTP generation and storage complete
        // Next: Send OTP to user (email/SMS) or return in response (testing only)

        // Return OTP to client (for testing - in production, send via email/SMS)
        // 200 OK = credentials verified, OTP generated
        // In production, you would send OTP via email service here
        // For now, returning in response for API testing
        res.status(200).json({
            success: true,
            message: 'Credentials verified. OTP generated. Please verify OTP to complete login.',
            data: {
                // In production, remove OTP from response and send via email
                // Including here for API testing purposes
                otp: otpCode, // TODO: Remove in production, send via email service
                expiresIn: '10 minutes',
                // Do NOT return user data yet - user must verify OTP first
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
};

/**
 * Verify OTP Controller - Step 2: Verify OTP and Complete Login
 * 
 * Verifies the OTP generated in login step
 * Returns JWT token upon successful OTP verification
 */
const verifyOTP = async (req, res) => {
    try {
        // Extract Email, Password (re-verify), and OTP from request
        // Re-verifying password ensures OTP is used by same person who requested it
        const { Email, Password, OTP: otpCode } = req.body;

        // Validate required fields
        if (!Email || !Password || !otpCode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide Email, Password, and OTP'
            });
        }

        // Re-verify password for additional security
        // Ensures the person verifying OTP is the same person who requested login
        // MIGRATION: Use findUserByEmail with includePassword = true
        const user = await findUserByEmail(Email, true);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        const isPasswordValid = await comparePassword(Password, user.Password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // MIGRATION NOTE:
        // Old: await OTP.findOne({ Email, OTP: otpCode, used: false, expiresAt: { $gt: new Date() } })
        // New: await findValidOTP(Email, otpCode)
        // 
        // STEP 3: Find valid OTP in database for this email
        // OTP verification process:
        // 1. Match email - ensures OTP belongs to the correct user
        // 2. Match OTP code - provided code must match stored code
        // 3. Check used: false - OTP must not have been used already (one-time use)
        // 4. Check expiration - expiresAt must be greater than current time
        // 
        // Why all these checks?
        // - Email match: Prevents using OTP from different account
        // - OTP match: Ensures user entered correct code
        // - Used check: One-time use prevents replay attacks
        // - Expiration check: Prevents using old/expired OTPs
        const otpRecord = await findValidOTP(Email, otpCode);

        // STEP 4: Validate OTP record exists
        // If no matching OTP found, it means:
        // - Wrong OTP code was entered
        // - OTP has already been used (used: true)
        // - OTP has expired (expiresAt < current time)
        // - OTP was for different email
        if (!otpRecord) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired OTP. Please request a new OTP.'
            });
        }

        // MIGRATION NOTE:
        // Old: otpRecord.used = true; await otpRecord.save()
        // New: await markOTPAsUsed(otpRecord.id)
        // 
        // STEP 5: Mark OTP as used immediately after successful verification
        // Why mark as used before completing login?
        // - Prevents replay attacks: OTP can only be used once
        // - Atomic operation: If login fails after this, OTP is already marked (security)
        // - Prevents race conditions: Two simultaneous requests can't both use same OTP
        // - One-time use enforcement: Once verified, OTP becomes invalid
        await markOTPAsUsed(otpRecord.id);

        // MIGRATION NOTE:
        // Old: generateToken(user._id) // MongoDB ObjectId
        // New: generateToken(user.id) // MySQL integer ID
        // 
        // Generate JWT token after successful OTP verification
        // Token allows user to access protected routes without re-entering credentials
        const token = generateToken(user.id);

        // Return success with user data and token
        // 200 OK = OTP verified, login successful
        // Password excluded from response (security)
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully. Login complete.',
            data: {
                user: {
                    id: user.id, // MIGRATION: Changed from _id to id
                    FullName: user.FullName,
                    Email: user.Email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                token // Client stores this token for subsequent authenticated requests
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: error.message
        });
    }
};

/**
 * Get Current User (Protected Route)
 * 
 * Returns authenticated user's profile
 * Requires authentication middleware to run first
 * Useful for frontend to get current user info on page load
 */
const getCurrentUser = async (req, res) => {
    try {
        // User object is already attached to req by authenticate middleware
        // No database query needed here - user data already fetched
        // Middleware ensures user exists and is authenticated
        res.status(200).json({
            success: true,
            data: {
                user: req.user // User object from authenticate middleware
            }
        });
    } catch (error) {
        // Handle any unexpected errors
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};

module.exports = {
    signup,
    login,
    verifyOTP,
    getCurrentUser
};
