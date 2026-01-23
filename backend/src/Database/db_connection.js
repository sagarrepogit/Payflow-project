// ============================================================================
// DATABASE CONNECTION - MySQL Connection Pool
// ============================================================================
// 
// MIGRATION FROM MONGODB TO MYSQL:
// - Replaced mongoose.connect() with mysql2.createPool()
// - Changed from single connection to connection pool (better performance)
// - MySQL uses connection pool to manage multiple database connections
// 
// WHY MYSQL2?
// mysql2 is the most popular MySQL driver for Node.js
// - Promise-based API (works with async/await)
// - Connection pooling (reuses connections efficiently)
// - Prepared statements (SQL injection protection)
// - Better performance than mysql package
// 
// WHY CONNECTION POOL?
// - Reuses connections instead of creating new ones for each query
// - Better performance: avoids connection overhead
// - Automatic connection management: creates/destroys connections as needed
// - Handles connection failures gracefully
// - Limits maximum connections (prevents database overload)

const mysql = require('mysql2/promise'); // Promise-based MySQL driver

// WHY IMPORT FROM CONFIG?
// We import environment config instead of using process.env directly
// This centralizes all environment variable handling in one place
// Benefits: easier testing, consistent validation, single source of truth
const { env } = require('../config/env.js');

/**
 * MySQL Connection Pool
 * 
 * WHY CONNECTION POOL?
 * - Pool manages multiple database connections
 * - Reuses connections instead of creating new ones each time
 * - Better performance: avoids connection overhead
 * - Automatic connection management
 * 
 * POOL CONFIGURATION:
 * - host: MySQL server address
 * - port: MySQL server port (default 3306)
 * - user: MySQL username
 * - password: MySQL password
 * - database: Database name to use
 * - waitForConnections: Wait if no connections available
 * - connectionLimit: Maximum connections in pool (10 = good for small apps)
 * - queueLimit: Maximum queued connection requests (0 = unlimited)
 */
let pool = null;

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
 * 
 * MIGRATION CHANGES:
 * - Old: mongoose.connect(env.MONGO_URI)
 * - New: mysql.createPool() with individual connection parameters
 * - Old: Single connection
 * - New: Connection pool (better for concurrent requests)
 */
const connectDB = async () => {
    try {
        // WHY TRY-CATCH?
        // Database connection can fail (wrong credentials, network issues, etc.)
        // try-catch prevents the app from crashing on connection errors
        // We can handle errors gracefully instead of crashing
        
        // WHY CREATE POOL?
        // Connection pool manages multiple database connections efficiently
        // Better than single connection: handles concurrent requests
        // Automatically creates/destroys connections as needed
        pool = mysql.createPool({
            host: env.DB_HOST,           // MySQL server address
            port: env.DB_PORT,           // MySQL server port (default 3306)
            user: env.DB_USER,           // MySQL username
            password: env.DB_PASSWORD,   // MySQL password
            database: env.DB_NAME,       // Database name to use
            waitForConnections: true,    // Wait if no connections available
            connectionLimit: 10,        // Maximum 10 connections in pool
            queueLimit: 0,              // Unlimited queued connection requests
            // WHY THESE OPTIONS?
            // - enableKeepAlive: Keep connections alive (prevents timeout)
            // - keepAliveInitialDelay: Initial delay before keep-alive (0 = immediate)
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });
        
        // WHY TEST CONNECTION?
        // Verifies that connection pool is working correctly
        // Tests actual database connectivity (not just pool creation)
        // Fails fast if database is unreachable or credentials are wrong
        const connection = await pool.getConnection();
        
        // WHY LOG CONNECTION INFO?
        // Helps developers know when database is connected successfully
        // Useful for debugging and monitoring
        // Shows which database server we're connected to
        console.log(`\n✅ MySQL Database Connected Successfully!`);
        console.log(`   Host: ${env.DB_HOST}:${env.DB_PORT}`);
        console.log(`   Database: ${env.DB_NAME}`);
        
        // WHY RELEASE CONNECTION?
        // getConnection() borrows a connection from the pool
        // Must release it back to pool so it can be reused
        // If we don't release, pool will run out of connections
        connection.release();
        
    } catch (error) {
        // WHY LOG ERROR?
        // Helps identify what went wrong during connection
        // Critical for debugging connection issues
        console.log("❌ MySQL Database Connection Error:", error.message);
        
        // WHY PROCESS.EXIT(1)?
        // If database connection fails, the app can't function properly
        // process.exit(1) stops the Node.js process completely
        // Exit code 1 means "error" (0 means "success")
        // Better to fail fast at startup than run with no database connection
        // Prevents cascading errors from missing database
        process.exit(1);
    }
};

/**
 * Get Database Connection Pool
 * 
 * WHY EXPORT POOL GETTER?
 * - Other files need access to the connection pool
 * - Allows executing SQL queries from controllers/models
 * - Encapsulates pool creation (only created once in connectDB)
 * 
 * USAGE:
 * const pool = getPool();
 * const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
 */
const getPool = () => {
    if (!pool) {
        throw new Error('Database pool not initialized. Call connectDB() first.');
    }
    return pool;
};

// WHY EXPORT BOTH?
// - connectDB(): Called once at application startup
// - getPool(): Called by models/controllers to execute queries
module.exports = {
    connectDB,
    getPool
};
