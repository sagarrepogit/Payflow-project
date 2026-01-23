// ============================================================================
// OTP MODEL - SQL Query Functions for OTPs Table
// ============================================================================
// 
// MIGRATION FROM MONGODB TO MYSQL:
// - Replaced Mongoose model with SQL query functions
// - Changed from OTP.findOne(), OTP.create(), OTP.updateMany() to SQL queries
// - Using prepared statements for SQL injection protection
// - All queries use connection pool from db_connection.js
// 
// WHY SQL QUERY FUNCTIONS?
// - Direct SQL queries give full control over database operations
// - Prepared statements prevent SQL injection attacks
// - Better performance: no ORM overhead
// - Clear and explicit: see exactly what SQL is executed

const { getPool } = require('../Database/db_connection.js');

/**
 * Find Valid OTP
 * 
 * MIGRATION NOTE:
 * - Old: OTP.findOne({ Email, OTP, used: false, expiresAt: { $gt: new Date() } })
 * - New: SELECT * FROM otps WHERE Email = ? AND OTP = ? AND used = 0 AND expiresAt > NOW()
 * 
 * WHY MULTIPLE CONDITIONS?
 * - Email match: Ensures OTP belongs to correct user
 * - OTP match: Verifies the code entered by user
 * - used = 0: Ensures OTP hasn't been used (one-time use)
 * - expiresAt > NOW(): Ensures OTP hasn't expired
 * 
 * @param {string} email - User's email address
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<Object|null>} OTP record or null if not found
 */
const findValidOTP = async (email, otpCode) => {
    const pool = getPool();
    
    // Normalize email to lowercase (like MongoDB lowercase: true)
    const normalizedEmail = email.toLowerCase().trim();
    
    // WHY NOW()?
    // MySQL NOW() returns current timestamp
    // Replaces MongoDB $gt: new Date() (greater than current time)
    // expiresAt > NOW() means OTP hasn't expired yet
    const query = `
        SELECT * FROM otps
        WHERE Email = ? 
        AND OTP = ? 
        AND used = 0
        AND expiresAt > NOW()
        ORDER BY createdAt DESC
        LIMIT 1
    `;
    
    const [rows] = await pool.execute(query, [normalizedEmail, otpCode]);
    
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Create New OTP
 * 
 * MIGRATION NOTE:
 * - Old: OTP.create({ Email, OTP, expiresAt, used: false })
 * - New: INSERT INTO otps (Email, OTP, expiresAt, used) VALUES (?, ?, ?, 0)
 * 
 * @param {Object} otpData - OTP data to insert
 * @param {string} otpData.Email - User's email
 * @param {string} otpData.OTP - 6-digit OTP code
 * @param {Date} otpData.expiresAt - Expiration timestamp
 * @returns {Promise<Object>} Created OTP record
 */
const createOTP = async (otpData) => {
    const pool = getPool();
    const { Email, OTP, expiresAt } = otpData;
    
    // Normalize email to lowercase
    const normalizedEmail = Email.toLowerCase().trim();
    
    // WHY INSERT INTO ... VALUES?
    // INSERT creates new row in otps table
    // used = 0 means false (unused)
    // expiresAt is passed as Date object, MySQL converts to TIMESTAMP
    const query = `
        INSERT INTO otps (Email, OTP, expiresAt, used)
        VALUES (?, ?, ?, 0)
    `;
    
    // WHY PASS DATE DIRECTLY?
    // mysql2 automatically converts JavaScript Date objects to MySQL TIMESTAMP format
    // No need to manually format - mysql2 handles the conversion
    // Date object is passed directly, mysql2 converts to 'YYYY-MM-DD HH:MM:SS'
    const [result] = await pool.execute(query, [normalizedEmail, OTP, expiresAt]);
    
    // Fetch created OTP to return complete data
    const createdOTP = await findOTPById(result.insertId);
    
    return createdOTP;
};

/**
 * Find OTP by ID
 * 
 * Helper function to fetch OTP by its ID
 * 
 * @param {number} otpId - OTP record ID
 * @returns {Promise<Object|null>} OTP record or null if not found
 */
const findOTPById = async (otpId) => {
    const pool = getPool();
    
    const query = 'SELECT * FROM otps WHERE id = ?';
    
    const [rows] = await pool.execute(query, [otpId]);
    
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Mark OTP as Used
 * 
 * MIGRATION NOTE:
 * - Old: otpRecord.used = true; await otpRecord.save()
 * - New: UPDATE otps SET used = 1 WHERE id = ?
 * 
 * WHY used = 1?
 * - MySQL BOOLEAN is stored as TINYINT(1)
 * - 1 = true, 0 = false
 * 
 * @param {number} otpId - OTP record ID
 * @returns {Promise<void>}
 */
const markOTPAsUsed = async (otpId) => {
    const pool = getPool();
    
    const query = 'UPDATE otps SET used = 1 WHERE id = ?';
    
    await pool.execute(query, [otpId]);
};

/**
 * Invalidate All Unused OTPs for Email
 * 
 * MIGRATION NOTE:
 * - Old: OTP.updateMany({ Email, used: false }, { used: true })
 * - New: UPDATE otps SET used = 1 WHERE Email = ? AND used = 0
 * 
 * WHY INVALIDATE OLD OTPS?
 * - Security: Only one valid OTP per email at a time
 * - Prevents confusion: User can't use old OTPs
 * - Prevents abuse: Old OTPs can't be used if new one is requested
 * 
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
const invalidateUnusedOTPs = async (email) => {
    const pool = getPool();
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    
    // WHY UPDATE ... SET used = 1?
    // Marks all unused OTPs for this email as used
    // Prevents multiple valid OTPs for same email
    const query = `
        UPDATE otps 
        SET used = 1 
        WHERE Email = ? AND used = 0
    `;
    
    await pool.execute(query, [normalizedEmail]);
};

/**
 * Cleanup Expired OTPs (Optional - for maintenance)
 * 
 * MIGRATION NOTE:
 * - MongoDB: TTL index automatically deleted expired OTPs
 * - MySQL: No built-in TTL, need manual cleanup
 * 
 * WHY MANUAL CLEANUP?
 * - MySQL doesn't have TTL (Time To Live) like MongoDB
 * - Can be called periodically (cron job) to clean up expired OTPs
 * - Optional: Queries already check expiration, but cleanup frees space
 * 
 * @returns {Promise<number>} Number of deleted OTPs
 */
const cleanupExpiredOTPs = async () => {
    const pool = getPool();
    
    // WHY DELETE ... WHERE expiresAt < NOW()?
    // Deletes all OTPs that have expired
    // NOW() is current timestamp
    // expiresAt < NOW() means expiration time has passed
    const query = 'DELETE FROM otps WHERE expiresAt < NOW()';
    
    const [result] = await pool.execute(query);
    
    // result.affectedRows is number of rows deleted
    return result.affectedRows;
};

// Export all query functions
module.exports = {
    findValidOTP,
    createOTP,
    findOTPById,
    markOTPAsUsed,
    invalidateUnusedOTPs,
    cleanupExpiredOTPs
};
