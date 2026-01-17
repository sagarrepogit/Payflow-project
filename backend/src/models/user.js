const mongoose= require('mongoose')
// Using validator library for email validation instead of manual regex
// because it's battle-tested, handles edge cases, and follows RFC standards
// Important for fintech apps where email verification is critical
const validator = require('validator')

// Note: Username field removed - login now uses Email for better UX and uniqueness
// Email is naturally unique, eliminating need for separate username system

// Password regex with positive lookaheads (?=...) explanation:
// - (?=.*[a-z]) - must contain at least one lowercase letter
// - (?=.*[A-Z]) - must contain at least one uppercase letter  
// - (?=.*\d) - must contain at least one digit
// - (?=.*[@$!%*?&]) - must contain at least one special character
// - [A-Za-z\d@$!%*?&]{8,64} - overall length 8-64 chars (NIST recommends 8+)
// Using lookaheads allows checking all requirements without ordering constraints
// Critical for fintech security compliance
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

const userSchema= new mongoose.Schema({
    // Full Name field - user's complete name for identification
    // Used for personalization, account display, and customer service
    FullName: {
        type: String,
        required: [true, 'Full Name is required'], // Required for user identification
        trim: true, // Remove leading/trailing whitespace
        // Allow reasonable name length - 2-100 characters
        // Minimum 2 prevents single character names, maximum 100 covers most real names
        minlength: [2, 'Full Name must be at least 2 characters long'],
        maxlength: [100, 'Full Name cannot exceed 100 characters'],
        // Allow letters, spaces, hyphens, apostrophes (common in names)
        // Regex ensures names contain at least some letters
        match: [/^[a-zA-Z\s'-]+$/, 'Full Name can only contain letters, spaces, hyphens, and apostrophes']
    },
    Email:{
        type:String,
        required:[true,'Email is required'], // Email is mandatory for user accounts
        lowercase:true, // Normalize email to lowercase - prevents duplicate accounts with same email
        unique: [true, 'Email is already registered'], // Unique constraint - one account per email
        // RFC 5321 specifies max email length of 254 characters
        // Enforcing this prevents database issues and follows standards
        maxlength:[254,'Email is too long'],
        trim: true, // Remove leading/trailing whitespace that users might accidentally enter
        validate:{
            validator: function(v){
                // Disallow empty string after trimming - ensures non-empty email
                if(!v) return false;
                // Use validator library's isEmail() instead of regex
                // Handles edge cases: international domains, special chars, etc.
                // Critical for fintech where email verification is important
                return validator.isEmail(v);
            },
            message: "please enter the valid email"
        }
    },
    Password:{
        type:String,
        required:[true,"Password is required"], // Password is mandatory
        // Minimum 8 characters: NIST recommendation, industry standard
        // Maximum 64: prevents DoS via extremely long passwords, reasonable limit
        minlength:[8,"Password must be at least 8 characters long"],
        maxlength:[64,"Password must be less than 64 characters"],
        // CRITICAL: select:false prevents password from being returned in queries
        // This is a security measure - passwords should NEVER be sent in API responses
        // When we need password (like login), we explicitly use .select('+Password')
        select:false,
        validate:{
            validator:function(v){
                // Disallow empty password - catch edge cases
                if(!v)return false;
                // Enforce strong password policy via regex
                // Required for fintech compliance and security standards
                if(!PASSWORD_REGEX.test(v)){
                    throw new Error (
                        "Password must include uppercase, lowercase, number and special character"
                    )
                }
                // Return true if all validation checks pass
                // Explicit return makes validation logic clear
                return true;
            }
        }
    },
    // Track when password was last changed
    // This enables future features:
    // - Token invalidation after password change
    // - Password change history/audit trail
    // - Security compliance reporting
    passwordChangedAt: {
        type: Date,
        default: null // Initially null, set when password changes
    }
}
// Enable timestamps (createdAt, updatedAt) automatically managed by Mongoose
// Useful for auditing, user account age, last activity tracking
, { timestamps: true }
)

// Check if model already exists (prevents re-compilation during hot reload)
// This pattern handles both initial model creation and module re-loading
// Important for development with nodemon
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Export using CommonJS (require/module.exports) to match project's module system
// All files use CommonJS, not ES6 modules
module.exports = User;