// WHY MONGOSE?
// Mongoose is an Object Data Modeling (ODM) library for MongoDB
// It provides schema validation, type casting, query building, and business logic hooks
// Think of it as a bridge between JavaScript objects and MongoDB documents
// Instead of writing raw MongoDB queries, Mongoose gives us a clean JavaScript API
const mongoose = require('mongoose');

// WHY IMPORT FROM CONFIG?
// We import environment config instead of using process.env directly
// This centralizes all environment variable handling in one place
// Benefits: easier testing, consistent validation, single source of truth
const { env } = require('../config/env.js');

/**
 * Database Connection Function
 * 
 * WHY ASYNC FUNCTION?
 * - Database connections are asynchronous operations (take time)
 * - async/await makes async code look like synchronous code (easier to read)
 * - Prevents blocking the event loop while waiting for database
 * 
 * WHY SEPARATE FUNCTION?
 * - Reusable: Can call connectDB() from anywhere in the app
 * - Testable: Easier to test database connection separately
 * - Modular: Database logic is separated from server logic
 * - Maintainable: Changes to connection logic only affect this file
 */
const connectDB = async () => {
    try {
        // WHY TRY-CATCH?
        // Database connection can fail (wrong URI, network issues, etc.)
        // try-catch prevents the app from crashing on connection errors
        // We can handle errors gracefully instead of crashing
        
        // WHY AWAIT?
        // mongoose.connect() returns a Promise (async operation)
        // await waits for the connection to complete before continuing
        // Without await, code would continue before connection is established
        
        // WHY MONGO_URI FROM ENV?
        // Database credentials should NEVER be hardcoded in code
        // Environment variables keep sensitive data (URI, passwords) separate
        // Different environments (dev, production) can use different databases
        const connectionInstance = await mongoose.connect(env.MONGO_URI);
        
        // WHY LOG CONNECTION INFO?
        // Helps developers know when database is connected successfully
        // Useful for debugging and monitoring
        // Shows which database server we're connected to
        console.log(`\n MongoDB is connected !! DB Host :${connectionInstance.connection.host}`);
        
    } catch (error) {
        // WHY LOG ERROR?
        // Helps identify what went wrong during connection
        // Critical for debugging connection issues
        console.log("MongoDB connection error", error);
        
        // WHY PROCESS.EXIT(1)?
        // If database connection fails, the app can't function properly
        // process.exit(1) stops the Node.js process completely
        // Exit code 1 means "error" (0 means "success")
        // Better to fail fast at startup than run with no database connection
        // Prevents cascading errors from missing database
        process.exit(1);
    }
}

// WHY EXPORT AS FUNCTION?
// Allows other files to import and call connectDB() when needed
// Common pattern in Node.js for reusable functionality
// Instead of running connection immediately, we export the function to control when it runs
module.exports = connectDB;