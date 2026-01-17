/**
 * OTP (One-Time Password) Utility Functions
 * 
 * Generates and validates OTPs for two-factor authentication
 */

/**
 * Generate a random 6-digit OTP (One-Time Password)
 * 
 * HOW OTP IS GENERATED:
 * Step 1: Math.random() generates a random decimal between 0 (inclusive) and 1 (exclusive)
 *         Example: 0.123456789 or 0.987654321
 * 
 * Step 2: Multiply by 900000 to get range 0 to 899999.999...
 *         Example: 0.123456789 * 900000 = 111111.1101
 * 
 * Step 3: Add 100000 to shift range to 100000 to 999999.999...
 *         Example: 111111.1101 + 100000 = 211111.1101
 * 
 * Step 4: Math.floor() removes decimal part, giving integer 100000 to 999999
 *         Example: Math.floor(211111.1101) = 211111
 * 
 * Step 5: Convert to string and pad to ensure exactly 6 digits
 *         Example: "211111" or "123456"
 * 
 * Why this method?
 * - Math.random() provides cryptographically sufficient randomness for OTPs
 * - Range 100000-999999 ensures exactly 6 digits (no leading zeros in the number)
 * - padStart() ensures consistent 6-character string format
 * 
 * Why 6 digits?
 * - Standard industry practice for SMS/email OTPs
 * - 1,000,000 possible combinations (10^6) - secure enough for short-lived codes
 * - Balance between security and usability (easy to type, remember, and verify)
 * - Short enough for quick entry, long enough to resist brute force
 * - Common length used by banks, payment gateways, and fintech apps
 * 
 * Security considerations:
 * - OTPs are short-lived (10 minutes expiration)
 * - One-time use only (marked as used after verification)
 * - Stored with expiration timestamp in database
 * - For production: should use crypto.randomInt() for better randomness
 * 
 * @returns {string} 6-digit OTP as string (e.g., "123456", "987654")
 */
const generateOTP = () => {
    // Generate random number between 100000 and 999999
    // Math.random() returns 0.0 to 0.999..., multiply by 900000 to get 0 to 899999.999...
    // Add 100000 to shift range to 100000 to 999999.999...
    // Math.floor() converts to integer, ensuring result is 100000 to 999999 (always 6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Convert number to string for consistent format
    // padStart(6, '0') ensures exactly 6 characters with leading zeros if needed
    // Example: if somehow we get 99999, it becomes "099999" (edge case handling)
    // This ensures OTP is always exactly 6 characters long
    return otp.toString().padStart(6, '0');
};

/**
 * Calculate OTP expiration time
 * 
 * HOW EXPIRATION IS CALCULATED:
 * Step 1: Get current timestamp in milliseconds (Date.now() or new Date().getTime())
 * Step 2: Convert minutes to milliseconds (minutes * 60 * 1000)
 * Step 3: Add milliseconds to current time to get future expiration time
 * Step 4: Create new Date object with expiration timestamp
 * 
 * Example:
 * - Current time: 2024-01-15 10:00:00 (timestamp: 1705312800000)
 * - Expiration: 10 minutes = 10 * 60 * 1000 = 600000 milliseconds
 * - Expiration time: 2024-01-15 10:10:00 (timestamp: 1705313400000)
 * 
 * Why 10 minutes default?
 * - Long enough: User has time to check email, copy OTP, and enter it
 * - Short enough: Limits security window if OTP is intercepted or compromised
 * - Industry standard: Most OTPs expire in 5-15 minutes
 * - Balance: Prevents frustration from too-short expiry, maintains security
 * 
 * Security benefits:
 * - Prevents old OTPs from being used if leaked later
 * - Reduces attack window - even if OTP is intercepted, limited time to use it
 * - Automatic cleanup: MongoDB TTL index deletes expired OTPs automatically
 * 
 * @param {number} minutes - Minutes until expiration (default: 10)
 * @returns {Date} Expiration date/time (JavaScript Date object)
 */
const getOTPExpiration = (minutes = 10) => {
    // Get current time in milliseconds since epoch (January 1, 1970)
    // This gives us the baseline timestamp to add expiration duration to
    const now = new Date();
    
    // Calculate expiration time:
    // - minutes * 60 = convert minutes to seconds
    // - * 1000 = convert seconds to milliseconds (Date uses milliseconds)
    // - now.getTime() gets current timestamp in milliseconds
    // - Add expiration duration to get future timestamp
    // - Create new Date object with that future timestamp
    return new Date(now.getTime() + minutes * 60 * 1000);
};

/**
 * Validate OTP format
 * 
 * HOW VALIDATION WORKS:
 * Regex pattern /^\d{6}$/ breakdown:
 * - ^ = start of string (ensures no leading characters)
 * - \d = digit (0-9) - matches exactly one digit
 * - {6} = exactly 6 occurrences of previous pattern (6 digits)
 * - $ = end of string (ensures no trailing characters)
 * 
 * Examples:
 * - "123456" → true (6 digits)
 * - "12345" → false (only 5 digits)
 * - "1234567" → false (7 digits)
 * - "abc123" → false (contains letters)
 * - "12 3456" → false (contains space)
 * - "012345" → true (leading zero is valid)
 * 
 * Why validate format?
 * - Prevents invalid OTP input before database lookup
 * - Early validation saves database query if format is wrong
 * - Ensures consistency - OTP must be exactly 6 numeric digits
 * - Security: Rejects malformed or malicious input
 * 
 * @param {string} otp - OTP to validate
 * @returns {boolean} True if valid format (exactly 6 digits), false otherwise
 */
const isValidOTPFormat = (otp) => {
    // Test if OTP matches pattern: exactly 6 digits from start to end
    // ^ = start, \d{6} = exactly 6 digits, $ = end
    // Returns true if format is correct, false otherwise
    return /^\d{6}$/.test(otp);
};

module.exports = {
    generateOTP,
    getOTPExpiration,
    isValidOTPFormat
};
