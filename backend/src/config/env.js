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
    
    // ============================================================================
    // MYSQL DATABASE CONFIGURATION - Migration from MongoDB
    // ============================================================================
    // 
    // WHY SEPARATE CONNECTION PARAMETERS?
    // MySQL uses individual connection parameters instead of connection string
    // More flexible: can configure host, port, user, password, database separately
    // Better for different environments (dev, staging, production)
    // 
    // MIGRATION NOTE:
    // Changed from MONGO_URI (connection string) to individual MySQL parameters
    // Old: MONGO_URI="mongodb://localhost:27017/payflow"
    // New: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
    
    // Database host - MySQL server address
    // Default: localhost (for local development)
    // Production: Use actual database server hostname/IP
    DB_HOST: process.env.DB_HOST || "localhost",
    
    // Database port - MySQL default port is 3306
    // Can be changed if MySQL runs on different port
    DB_PORT: parseInt(process.env.DB_PORT) || 3306,
    
    // Database user - MySQL username for authentication
    // Required: Must have permissions to access database
    DB_USER: required("DB_USER"),
    
    // Database password - MySQL password for authentication
    // Required: Security - database access requires password
    DB_PASSWORD: required("DB_PASSWORD"),
    
    // Database name - Name of the MySQL database to use
    // Required: Application needs to know which database to connect to
    // Example: "payflow_db"
    DB_NAME: required("DB_NAME"),
    
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