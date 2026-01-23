-- ============================================================================
-- DATABASE SCHEMA - MySQL Table Definitions
-- ============================================================================
-- 
-- MIGRATION FROM MONGODB TO MYSQL:
-- This file contains SQL CREATE TABLE statements that replicate the MongoDB
-- schemas (user.js and otp.js) in MySQL relational database format.
-- 
-- WHY SQL SCHEMA FILE?
-- - Version control: Track database structure changes in git
-- - Documentation: Clear definition of database structure
-- - Deployment: Easy to recreate database in new environments
-- - Team collaboration: Everyone knows exact table structure
-- 
-- HOW TO USE:
-- 1. Create database: CREATE DATABASE payflow_db;
-- 2. Run this file: mysql -u root -p payflow_db < schema.sql
-- 3. Or execute statements in MySQL client/workbench

-- ============================================================================
-- USERS TABLE - Stores user account information
-- ============================================================================
-- 
-- MIGRATION NOTES:
-- - MongoDB _id (ObjectId) → MySQL id (INT AUTO_INCREMENT PRIMARY KEY)
-- - MongoDB timestamps → MySQL createdAt/updatedAt (TIMESTAMP with defaults)
-- - MongoDB lowercase email → MySQL LOWER() function in queries
-- - MongoDB unique index → MySQL UNIQUE constraint
-- - MongoDB select:false for password → MySQL: just don't SELECT it in queries
-- 
-- WHY INNODB ENGINE?
-- - Supports transactions (ACID compliance)
-- - Foreign key constraints (if needed later)
-- - Row-level locking (better concurrency)
-- - Crash recovery
CREATE TABLE IF NOT EXISTS users (
    -- PRIMARY KEY: Unique identifier for each user
    -- AUTO_INCREMENT: MySQL automatically generates sequential IDs (1, 2, 3...)
    -- Unlike MongoDB ObjectId, MySQL uses integer IDs
    -- INT UNSIGNED: Only positive numbers, allows up to 4.2 billion users
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Full Name: User's complete name for identification
    -- VARCHAR(100): Variable length string, max 100 characters
    -- NOT NULL: Required field (like MongoDB required: true)
    -- TRIM in application: We'll trim whitespace in Node.js code
    FullName VARCHAR(100) NOT NULL,
    
    -- Email: User's email address (used for login)
    -- VARCHAR(254): RFC 5321 max email length is 254 characters
    -- UNIQUE: Ensures no duplicate emails (entity integrity)
    -- NOT NULL: Required field
    -- LOWER() in queries: We'll normalize to lowercase in application code
    -- INDEX: Fast lookups by email (login queries)
    Email VARCHAR(254) NOT NULL UNIQUE,
    INDEX idx_email (Email),
    
    -- Password: Hashed password (bcrypt hash, not plain text)
    -- VARCHAR(255): Bcrypt hashes are always 60 characters, but extra space for future
    -- NOT NULL: Required field
    -- Never SELECT this field in queries unless needed (security)
    Password VARCHAR(255) NOT NULL,
    
    -- Password Changed At: Timestamp when password was last changed
    -- NULL: Initially null, set when password changes
    -- Useful for: Token invalidation, password change history, security audits
    passwordChangedAt TIMESTAMP NULL DEFAULT NULL,
    
    -- Created At: Timestamp when user account was created
    -- DEFAULT CURRENT_TIMESTAMP: Automatically set on INSERT
    -- NOT NULL: Always has a value
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Updated At: Timestamp when user record was last modified
    -- DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP: Auto-updates on UPDATE
    -- NOT NULL: Always has a value
    -- Replaces MongoDB's automatic updatedAt timestamp
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- OTP (One-Time Password) TABLE - Stores OTPs for two-factor authentication
-- ============================================================================
-- 
-- MIGRATION NOTES:
-- - MongoDB _id → MySQL id (INT AUTO_INCREMENT PRIMARY KEY)
-- - MongoDB TTL index (expireAfterSeconds: 0) → MySQL: Manual cleanup or scheduled job
-- - MongoDB compound index {Email: 1, used: 1} → MySQL composite index
-- - MongoDB lowercase email → MySQL LOWER() in queries
-- 
-- WHY SEPARATE TABLE?
-- - OTPs are temporary (expire quickly)
-- - Different structure than users
-- - Can be cleaned up independently
-- - Better performance (smaller table for OTP lookups)
CREATE TABLE IF NOT EXISTS otps (
    -- PRIMARY KEY: Unique identifier for each OTP record
    -- AUTO_INCREMENT: Sequential IDs
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Email: Associated email address for the OTP
    -- VARCHAR(254): Same max length as users.Email
    -- NOT NULL: Required field
    -- INDEX: Fast lookups by email (OTP verification queries)
    -- LOWER() in queries: Normalize to lowercase in application
    Email VARCHAR(254) NOT NULL,
    INDEX idx_otp_email (Email),
    
    -- OTP Code: The 6-digit one-time password
    -- VARCHAR(6): Exactly 6 digits (e.g., "123456")
    -- NOT NULL: Required field
    -- Stored as string to preserve leading zeros if needed
    OTP VARCHAR(6) NOT NULL,
    
    -- Expires At: Timestamp when OTP becomes invalid
    -- TIMESTAMP: Date and time when OTP expires
    -- NOT NULL: Required field
    -- INDEX: Fast queries for expired OTP cleanup
    -- Note: MySQL doesn't have TTL like MongoDB, so we'll check expiration in queries
    expiresAt TIMESTAMP NOT NULL,
    INDEX idx_otp_expires (expiresAt),
    
    -- Used: Whether OTP has been used (one-time use)
    -- BOOLEAN/TINYINT(1): true/false (1/0 in MySQL)
    -- DEFAULT 0 (false): Initially unused
    -- INDEX: Fast filtering of used OTPs
    used TINYINT(1) NOT NULL DEFAULT 0,
    INDEX idx_otp_used (used),
    
    -- Created At: Timestamp when OTP was generated
    -- DEFAULT CURRENT_TIMESTAMP: Automatically set on INSERT
    -- Useful for: Auditing, rate limiting, debugging
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- COMPOSITE INDEX: Email + Used status
    -- Optimizes queries like: WHERE Email = ? AND used = 0
    -- Used in OTP verification: Find unused OTP for email
    INDEX idx_otp_email_used (Email, used)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- NOTES ON MYSQL vs MONGODB DIFFERENCES:
-- ============================================================================
-- 
-- 1. ID GENERATION:
--    - MongoDB: ObjectId (24-char hex string, e.g., "507f1f77bcf86cd799439011")
--    - MySQL: AUTO_INCREMENT integer (1, 2, 3, ...)
--    - Impact: JWT tokens store userId - need to use integer ID instead of ObjectId
-- 
-- 2. TIMESTAMPS:
--    - MongoDB: createdAt/updatedAt managed by Mongoose
--    - MySQL: DEFAULT CURRENT_TIMESTAMP and ON UPDATE CURRENT_TIMESTAMP
--    - Impact: Automatic timestamp management in MySQL
-- 
-- 3. CASE SENSITIVITY:
--    - MongoDB: lowercase: true in schema
--    - MySQL: Use LOWER() function in queries or application-level normalization
--    - Impact: Normalize email to lowercase in Node.js code before queries
-- 
-- 4. TTL (Time To Live):
--    - MongoDB: Automatic deletion via TTL index
--    - MySQL: No built-in TTL - need scheduled job or manual cleanup
--    - Impact: Add cleanup job or check expiration in queries
-- 
-- 5. VALIDATION:
--    - MongoDB: Schema-level validation (minlength, maxlength, regex, etc.)
--    - MySQL: Basic constraints (NOT NULL, UNIQUE, CHECK) + application-level validation
--    - Impact: Move validation logic to application code (controllers/utils)
-- 
-- 6. QUERY SYNTAX:
--    - MongoDB: findOne({ Email: "..." }), create({ ... })
--    - MySQL: SELECT * FROM users WHERE Email = ?, INSERT INTO users (...)
--    - Impact: Rewrite all database queries to use SQL
