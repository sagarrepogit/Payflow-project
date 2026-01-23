// ============================================================================
// USER MODEL - SQL Query Functions for Users Table
// ============================================================================
// 
// MIGRATION FROM MONGODB TO MYSQL:
// - Replaced Mongoose model with SQL query functions
// - Changed from User.findOne(), User.create() to SQL SELECT, INSERT queries
// - Using prepared statements for SQL injection protection
// - All queries use connection pool from db_connection.js
// 
// WHY SQL QUERY FUNCTIONS?
// - Direct SQL queries give full control over database operations
// - Prepared statements prevent SQL injection attacks
// - Better performance: no ORM overhead
// - Clear and explicit: see exactly what SQL is executed
// 
// WHY NOT ORM (Sequelize, TypeORM)?
// - Simpler: No need for complex ORM setup
// - Lightweight: Less dependencies, faster startup
// - Direct: Write SQL directly, easier to optimize
// - Learning: Better understanding of SQL queries

const { getPool } = require('../Database/db_connection.js');
const validator = require('validator');

// Password regex validation (same as before)
// Used for application-level validation before database insert
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

/**
 * Find User by Email
 * 
 * MIGRATION NOTE:
 * - Old: User.findOne({ Email: email })
 * - New: SELECT * FROM users WHERE Email = ?
 * 
 * WHY PREPARED STATEMENT?
 * - Prevents SQL injection attacks
 * - ? is placeholder, value is passed separately
 * - MySQL escapes special characters automatically
 * 
 * @param {string} email - User's email address (will be normalized to lowercase)
 * @param {boolean} includePassword - Whether to include password in result (default: false)
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findUserByEmail = async (email, includePassword = false) => {
    const pool = getPool();
    
    // Normalize email to lowercase (like MongoDB lowercase: true)
    // Ensures case-insensitive email matching
    const normalizedEmail = email.toLowerCase().trim();
    
    // WHY PREPARED STATEMENT?
    // ? is placeholder - MySQL will safely escape the email value
    // Prevents SQL injection: even if email contains SQL code, it's treated as data
    // Example: email = "'; DROP TABLE users; --" won't execute SQL
    const query = includePassword
        ? 'SELECT * FROM users WHERE Email = ?'
        : 'SELECT id, FullName, Email, passwordChangedAt, createdAt, updatedAt FROM users WHERE Email = ?';
    
    // WHY EXECUTE()?
    // execute() uses prepared statements (safe from SQL injection)
    // Returns [rows, fields] - we only need rows
    // [0] gets first element (rows array)
    const [rows] = await pool.execute(query, [normalizedEmail]);
    
    // WHY RETURN ROWS[0] OR NULL?
    // MySQL returns array of rows (even if one result)
    // rows[0] is first row, or undefined if no rows
    // Return null for consistency (like Mongoose returns null if not found)
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Find User by ID
 * 
 * MIGRATION NOTE:
 * - Old: User.findById(userId)
 * - New: SELECT * FROM users WHERE id = ?
 * 
 * WHY ID INSTEAD OF _ID?
 * - MySQL uses 'id' as primary key column name
 * - MongoDB used '_id' (ObjectId)
 * - JWT tokens now store integer ID instead of ObjectId string
 * 
 * @param {number} userId - User's ID (integer, not ObjectId)
 * @param {boolean} includePassword - Whether to include password in result (default: false)
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findUserById = async (userId, includePassword = false) => {
    const pool = getPool();
    
    const query = includePassword
        ? 'SELECT * FROM users WHERE id = ?'
        : 'SELECT id, FullName, Email, passwordChangedAt, createdAt, updatedAt FROM users WHERE id = ?';
    
    const [rows] = await pool.execute(query, [userId]);
    
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Create New User
 * 
 * MIGRATION NOTE:
 * - Old: User.create({ FullName, Email, Password })
 * - New: INSERT INTO users (FullName, Email, Password) VALUES (?, ?, ?)
 * 
 * WHY VALIDATION BEFORE INSERT?
 * - MySQL has basic constraints (NOT NULL, UNIQUE) but not complex validation
 * - Application-level validation ensures data quality
 * - Better error messages for users
 * 
 * @param {Object} userData - User data to insert
 * @param {string} userData.FullName - User's full name
 * @param {string} userData.Email - User's email (will be normalized)
 * @param {string} userData.Password - Hashed password
 * @returns {Promise<Object>} Created user object with generated ID
 */
const createUser = async (userData) => {
    const pool = getPool();
    const { FullName, Email, Password } = userData;
    
    // WHY VALIDATE BEFORE DATABASE?
    // Application-level validation (like Mongoose schema validation)
    // MySQL constraints catch some errors, but application validation is better
    
    // Validate FullName
    if (!FullName || typeof FullName !== 'string') {
        throw new Error('Full Name is required');
    }
    const trimmedName = FullName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
        throw new Error('Full Name must be between 2 and 100 characters');
    }
    if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
        throw new Error('Full Name can only contain letters, spaces, hyphens, and apostrophes');
    }
    
    // Validate Email
    if (!Email || typeof Email !== 'string') {
        throw new Error('Email is required');
    }
    const normalizedEmail = Email.toLowerCase().trim();
    if (normalizedEmail.length > 254) {
        throw new Error('Email is too long');
    }
    if (!validator.isEmail(normalizedEmail)) {
        throw new Error('Please enter a valid email');
    }
    
    // Validate Password
    if (!Password || typeof Password !== 'string') {
        throw new Error('Password is required');
    }
    if (Password.length < 8 || Password.length > 64) {
        throw new Error('Password must be between 8 and 64 characters');
    }
    if (!PASSWORD_REGEX.test(Password)) {
        throw new Error('Password must include uppercase, lowercase, number and special character');
    }
    
    // WHY INSERT INTO ... VALUES?
    // INSERT creates new row in users table
    // ? placeholders prevent SQL injection
    // Returns insertId (auto-generated ID)
    const query = `
        INSERT INTO users (FullName, Email, Password)
        VALUES (?, ?, ?)
    `;
    
    // WHY EXECUTE()?
    // execute() uses prepared statements
    // Returns [result, fields]
    // result.insertId is the auto-generated ID
    const [result] = await pool.execute(query, [trimmedName, normalizedEmail, Password]);
    
    // WHY FETCH CREATED USER?
    // INSERT doesn't return the full row, only insertId
    // Fetch the created user to return complete data (like Mongoose create)
    const createdUser = await findUserById(result.insertId);
    
    return createdUser;
};

/**
 * Update User Password
 * 
 * MIGRATION NOTE:
 * - Old: user.passwordChangedAt = Date.now(); await user.save()
 * - New: UPDATE users SET Password = ?, passwordChangedAt = NOW() WHERE id = ?
 * 
 * @param {number} userId - User's ID
 * @param {string} hashedPassword - New hashed password
 * @returns {Promise<void>}
 */
const updateUserPassword = async (userId, hashedPassword) => {
    const pool = getPool();
    
    const query = `
        UPDATE users 
        SET Password = ?, passwordChangedAt = NOW()
        WHERE id = ?
    `;
    
    await pool.execute(query, [hashedPassword, userId]);
};

// Export all query functions
// Other files import these instead of Mongoose model
module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserPassword
};
