// Load environment variables from .env file into process.env
// This keeps sensitive data (DB credentials, secrets) out of code
// Critical for security and deployment flexibility
const dotenv= require('dotenv');
dotenv.config();

// Helper function to validate required environment variables
// Fails fast at startup if critical config is missing
// Better to fail immediately than have runtime errors later
function required(parameter){
    const v =process.env[parameter];
    if(!v){
        // Throw error to prevent server from starting without required config
        throw new Error(`missing required env parameter: ${parameter}`);
    } return v;
}

// Centralized environment configuration object
// Single source of truth for all env variables
// Makes it easy to see what config is needed and provides defaults
const env={
    // PORT with default fallback for development convenience
    // Default 4000 prevents crashes if PORT not set locally
    PORT: (process.env.PORT || 4000),
    
    // MongoDB connection string - required, no default
    // Database connection is essential, so fail if missing
    MONGO_URI:required("MONGO_URI"),
    
    // JWT secret for signing tokens - MUST be set in production
    // Required because JWT authentication won't work without it
    JWT_SECRET:required("JWT_SECRET"),
    
    // JWT expiration time - default 7 days
    // Balance between security (shorter) and UX (longer sessions)
    // 7 days is common for fintech apps
    JWT_EXPIRE: process.env.JWT_EXPIRE || "7d"
}

// Export as object with env property for destructuring: const {env} = require(...)
// This pattern allows future expansion without breaking existing imports
module.exports={env};