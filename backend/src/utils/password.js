// ============================================================================
// PASSWORD UTILITIES - Secure password hashing and comparison
// ============================================================================
// 
// WHY SEPARATE PASSWORD UTILITIES?
// Reusable functions for password operations
// Used in multiple places (signup, login, password reset)
// Easier to test and maintain when separated
// Single responsibility: handles only password-related operations

// WHY BCRYPTJS?
// bcryptjs is JavaScript implementation of bcrypt algorithm
// Industry standard for password hashing
// 
// WHY BCRYPT SPECIFICALLY?
// - Designed for passwords: Built specifically for hashing passwords (not general hashing)
// - Automatic salt: Adds random salt to each password (prevents rainbow table attacks)
// - Slow by design: Intentionally slow to resist brute force attacks
// - Adaptive: Can increase rounds as computers get faster (future-proof)
// - Battle-tested: Used by millions of applications worldwide
// 
// WHY NOT MD5 OR SHA?
// - MD5/SHA are fast (good for files, bad for passwords)
// - Fast = easy to brute force (can try millions of passwords per second)
// - No built-in salt (must add manually)
// - Designed for data integrity, not password security
// 
// HOW BCRYPT WORKS:
// 1. Takes plain password (e.g., "MyPassword123")
// 2. Generates random salt (unique per password)
// 3. Combines password + salt
// 4. Hashes with multiple rounds (12 rounds = 2^12 = 4096 iterations)
// 5. Returns hash like: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Ly..."
// 
// SECURITY BENEFITS:
// - Same password = different hash (due to salt)
// - Slow hashing = attacker can't try many passwords quickly
// - One-way: Can't reverse hash to get original password
const bcrypt = require('bcryptjs');

/**
 * Hash password using bcrypt
 * 
 * WHAT DOES THIS DO?
 * Converts plain text password to secure hash
 * Hash can be stored in database safely (even if database is compromised)
 * 
 * WHY ASYNC FUNCTION?
 * bcrypt operations are CPU-intensive (slow by design)
 * async/await prevents blocking Node.js event loop
 * Without async, server would freeze while hashing (can't handle other requests)
 * 
 * SALT ROUNDS EXPLAINED:
 * - Salt rounds = number of times hash is re-hashed
 * - 12 rounds = password is hashed 2^12 times (4096 iterations)
 * - Each round makes hash more secure but takes longer
 * - Higher rounds = exponentially more secure (2x rounds = 2x time)
 * 
 * WHY 12 ROUNDS SPECIFICALLY?
 * - Balance between security and performance
 * - 12 rounds takes ~250ms on modern hardware (acceptable delay)
 * - 10 rounds = minimum recommended (too low for financial apps)
 * - 12+ rounds = standard for fintech/banking applications
 * - Higher than 15 rounds = too slow (bad user experience)
 * 
 * PERFORMANCE IMPACT:
 * - 10 rounds: ~100ms (fast but less secure)
 * - 12 rounds: ~250ms (good balance) ← WE USE THIS
 * - 15 rounds: ~1000ms (very secure but slow)
 * 
 * HOW IT WORKS:
 * 1. Takes plain password string
 * 2. bcrypt generates random salt automatically
 * 3. Hashes password with salt (4096 iterations)
 * 4. Returns hash string (contains salt + hash)
 * 5. Hash is stored in database (never store plain password!)
 */
const hashPassword = async (password) => {
    // WHY CONST SALTROUNDS?
    // Constant variable makes it easy to change security level
    // 12 rounds is optimal for fintech (security + performance)
    // Can increase in future if needed (e.g., to 15 for even more security)
    const saltRounds = 12; // Higher rounds for fintech security
    
    // WHY AWAIT?
    // bcrypt.hash() returns Promise (async operation)
    // await waits for hashing to complete before returning
    // Returns hash string like: "$2a$12$LQv3c1yqBWVHxkd0LHAkCO..."
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hashed password
 * 
 * WHAT DOES THIS DO?
 * Checks if plain text password matches stored hash
 * Used during login to verify user entered correct password
 * 
 * WHY CAN'T WE COMPARE DIRECTLY?
 * - Passwords are stored as hashes (not plain text)
 * - Can't compare "MyPassword123" === "$2a$12$LQv3c..." (they're different)
 * - Hash is one-way: Can't convert hash back to password
 * - Must hash input password and compare hashes
 * 
 * HOW BCRYPT.COMPARE WORKS:
 * 1. Extracts salt from hashedPassword (bcrypt stores salt with hash)
 * 2. Hashes input password using same salt
 * 3. Compares new hash with stored hash
 * 4. Returns true if match, false if not
 * 
 * WHY AUTOMATIC SALT EXTRACTION?
 * - bcrypt stores salt inside the hash string
 * - No need to store salt separately in database
 * - bcrypt.compare() extracts salt automatically
 * - Makes comparison simple: just pass both values
 * 
 * WHY ASYNC?
 * - Consistent with hashPassword (both are async)
 * - Non-blocking operation (doesn't freeze server)
 * - bcrypt comparison also takes time (by design, for security)
 * 
 * SECURITY FEATURES:
 * - Timing-safe: Always takes same time whether match or not
 * - Prevents timing attacks: Attacker can't determine if password is close
 * - Constant-time comparison: No information leakage through response time
 * 
 * EXAMPLE USAGE:
 * - User enters: "MyPassword123"
 * - Database has: "$2a$12$LQv3c1yqBWVHxkd0LHAkCO..."
 * - bcrypt.compare() hashes "MyPassword123" with salt from stored hash
 * - Compares hashes, returns true if they match
 */
const comparePassword = async (password, hashedPassword) => {
    // WHY JUST PASS BOTH VALUES?
    // bcrypt.compare() handles everything automatically:
    // - Extracts salt from hashedPassword
    // - Hashes password with that salt
    // - Compares results
    // - Returns boolean (true = match, false = no match)
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    hashPassword,
    comparePassword
};
