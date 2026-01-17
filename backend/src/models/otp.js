const mongoose = require('mongoose');

/**
 * OTP (One-Time Password) Model
 * 
 * Stores OTPs for email-based login verification
 * OTPs expire after a set time for security
 */
const otpSchema = new mongoose.Schema({
    // Email associated with the OTP
    // Used to match OTP with the correct user login attempt
    Email: {
        type: String,
        required: [true, 'Email is required for OTP'],
        lowercase: true, // Normalize to lowercase for consistent lookups
        trim: true,
        // Index for faster lookups during OTP verification
        index: true
    },
    // The OTP code itself (6-digit number)
    // Stored as string to preserve leading zeros if needed
    OTP: {
        type: String,
        required: [true, 'OTP code is required'],
        // 6-digit OTP is standard for security codes
        match: [/^\d{6}$/, 'OTP must be exactly 6 digits']
    },
    // Expiration timestamp - OTP becomes invalid after this time
    // Security measure: prevents old OTPs from being reused
    expiresAt: {
        type: Date,
        required: [true, 'OTP expiration time is required'],
        // TTL (Time To Live) index for automatic cleanup of expired OTPs
        // expireAfterSeconds: 0 means MongoDB will delete documents when expiresAt time passes
        // Why automatic cleanup?
        // - Frees database space by removing expired OTPs
        // - Prevents database bloat from accumulating expired OTPs
        // - No manual cleanup needed - MongoDB handles it automatically
        // - Security: Ensures expired OTPs are permanently deleted
        index: { expireAfterSeconds: 0 }
    },
    // Track if OTP has been used
    // One-time use prevents replay attacks
    // Once verified, OTP cannot be used again
    used: {
        type: Boolean,
        default: false,
        index: true // Index for filtering used OTPs
    },
    // Timestamp when OTP was created
    // Useful for auditing and rate limiting
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    // Don't include timestamps: true since we have custom createdAt
    // This prevents automatic updatedAt field
    timestamps: false
});

// Compound index on Email and used status for efficient OTP lookup
// When verifying OTP, we search for Email + used: false
otpSchema.index({ Email: 1, used: 1 });

// Create model - check if it exists first (handles hot reload in development)
const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);

module.exports = OTP;
