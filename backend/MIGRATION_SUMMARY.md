# MongoDB to MySQL Migration - Complete Summary

## 🎯 Migration Overview

Successfully migrated the entire PayFlow project from **MongoDB (NoSQL)** to **MySQL (Relational Database)**. All database operations now use SQL queries instead of Mongoose ODM.

---

## 📋 What Was Done

### 1. **Dependencies Updated** ✅

**File**: `backend/package.json`

**Changes**:
- ❌ **Removed**: `mongoose: ^8.21.0` (MongoDB ODM)
- ✅ **Added**: `mysql2: ^3.6.5` (MySQL driver with Promise support)

**Why mysql2?**
- Promise-based API (works with async/await)
- Connection pooling (better performance)
- Prepared statements (SQL injection protection)
- Industry standard for Node.js MySQL connections

---

### 2. **Configuration Updated** ✅

**File**: `backend/src/config/env.js`

**Changes**:
- ❌ **Removed**: `MONGO_URI` (MongoDB connection string)
- ✅ **Added**:
  - `DB_HOST` - MySQL server host (default: localhost)
  - `DB_PORT` - MySQL server port (default: 3306)
  - `DB_USER` - MySQL username (required)
  - `DB_PASSWORD` - MySQL password (required)
  - `DB_NAME` - Database name (required)

**Why separate parameters?**
- More flexible configuration
- Better for different environments (dev, staging, production)
- Standard MySQL connection pattern

---

### 3. **Database Connection Rewritten** ✅

**File**: `backend/src/Database/db_connection.js`

**Changes**:
- **Completely rewritten** from Mongoose to MySQL connection pool
- **Old**: `mongoose.connect(env.MONGO_URI)` - Single connection
- **New**: `mysql.createPool()` - Connection pool (better for concurrent requests)

**Key Features**:
- Connection pooling (reuses connections efficiently)
- Automatic connection management
- Error handling with graceful shutdown
- Exports `connectDB()` and `getPool()` functions

**Why Connection Pool?**
- Reuses connections (avoids connection overhead)
- Handles concurrent requests better
- Automatic connection lifecycle management
- Limits maximum connections (prevents database overload)

---

### 4. **Database Schema Created** ✅

**File**: `backend/src/Database/schema.sql` (NEW FILE)

**What It Contains**:
- `CREATE TABLE` statements for `users` and `otps` tables
- Primary keys (AUTO_INCREMENT integers)
- UNIQUE constraints (Email uniqueness)
- Indexes for performance (Email, expiresAt, used)
- Timestamps (createdAt, updatedAt with auto-update)

**Key Design Decisions**:
- `id` as INT UNSIGNED AUTO_INCREMENT (replaces MongoDB ObjectId)
- VARCHAR(254) for Email (RFC 5321 max length)
- VARCHAR(255) for Password (bcrypt hash storage)
- TINYINT(1) for boolean (used field)
- TIMESTAMP for dates (with auto-update for updatedAt)
- InnoDB engine (supports transactions, foreign keys)

---

### 5. **User Model Converted** ✅

**File**: `backend/src/models/user.js`

**Changes**:
- ❌ **Removed**: Mongoose schema and model
- ✅ **Added**: SQL query functions:
  - `findUserByEmail(email, includePassword)`
  - `findUserById(userId, includePassword)`
  - `createUser(userData)`
  - `updateUserPassword(userId, hashedPassword)`

**Key Features**:
- Prepared statements (SQL injection protection)
- Application-level validation (replaces Mongoose validation)
- Email normalization (lowercase)
- Password exclusion by default (security)

**Migration Notes**:
- `user._id` → `user.id` (integer instead of ObjectId)
- Validation moved from schema to application code
- Error handling for MySQL-specific errors

---

### 6. **OTP Model Converted** ✅

**File**: `backend/src/models/otp.js`

**Changes**:
- ❌ **Removed**: Mongoose schema and model
- ✅ **Added**: SQL query functions:
  - `findValidOTP(email, otpCode)`
  - `createOTP(otpData)`
  - `findOTPById(otpId)`
  - `markOTPAsUsed(otpId)`
  - `invalidateUnusedOTPs(email)`
  - `cleanupExpiredOTPs()` (optional maintenance)

**Key Features**:
- Expiration checking (`expiresAt > NOW()`)
- One-time use enforcement (`used = 0`)
- Email normalization
- Prepared statements

**Migration Notes**:
- MongoDB TTL index → Manual expiration checking
- `updateMany()` → `UPDATE ... SET used = 1 WHERE ...`
- Compound index on (Email, used) for performance

---

### 7. **Auth Controller Updated** ✅

**File**: `backend/src/controllers/authController.js`

**Changes**:
- Replaced all Mongoose queries with SQL functions
- Updated error handling:
  - `error.code === 11000` (MongoDB) → `error.code === 'ER_DUP_ENTRY'` (MySQL)
  - `error.name === 'ValidationError'` → Application-level validation errors
- Changed `user._id` to `user.id` throughout
- Updated OTP operations to use SQL functions

**Functions Updated**:
- `signup()` - Uses `findUserByEmail()` and `createUser()`
- `login()` - Uses `findUserByEmail()` and `invalidateUnusedOTPs()`, `createOTP()`
- `verifyOTP()` - Uses `findValidOTP()` and `markOTPAsUsed()`
- `getCurrentUser()` - No changes (uses middleware data)

---

### 8. **Auth Middleware Updated** ✅

**File**: `backend/src/middleware/auth.js`

**Changes**:
- Replaced `User.findById()` with `findUserById()`
- Changed `user._id` to `user.id` in JWT tokens
- Updated comments to reflect MySQL migration

**Key Points**:
- JWT tokens now store integer `userId` instead of ObjectId string
- Token generation/verification logic unchanged
- User lookup uses SQL query function

---

### 9. **Server Entry Point Updated** ✅

**File**: `backend/src/server.js`

**Changes**:
- Updated import: `const { connectDB } = require('./Database/db_connection.js')`
- Changed from single function export to destructured export

**Why?**
- New connection module exports both `connectDB` and `getPool`
- Destructuring allows importing only what's needed

---

## 🔄 Code Comparison Examples

### Before (MongoDB/Mongoose):
```javascript
// Connection
await mongoose.connect(env.MONGO_URI);

// Find user
const user = await User.findOne({ Email: email });

// Create user
const user = await User.create({ FullName, Email, Password });

// Error handling
if (error.code === 11000) { /* duplicate key */ }
```

### After (MySQL/SQL):
```javascript
// Connection
await connectDB(); // Creates connection pool

// Find user
const user = await findUserByEmail(email);

// Create user
const user = await createUser({ FullName, Email, Password });

// Error handling
if (error.code === 'ER_DUP_ENTRY') { /* duplicate entry */ }
```

---

## 📊 Database Schema Comparison

### Users Table
| Field | MongoDB | MySQL | Notes |
|-------|---------|-------|-------|
| ID | `_id` (ObjectId) | `id` (INT) | Auto-increment integer |
| FullName | String | VARCHAR(100) | Same |
| Email | String (unique) | VARCHAR(254) UNIQUE | Indexed |
| Password | String | VARCHAR(255) | Bcrypt hash |
| Timestamps | Auto (Mongoose) | TIMESTAMP (auto) | Auto-update |

### OTPs Table
| Field | MongoDB | MySQL | Notes |
|-------|---------|-------|-------|
| ID | `_id` (ObjectId) | `id` (INT) | Auto-increment |
| Email | String | VARCHAR(254) | Indexed |
| OTP | String | VARCHAR(6) | 6 digits |
| expiresAt | Date (TTL) | TIMESTAMP | Manual expiration check |
| used | Boolean | TINYINT(1) | 0/1 for false/true |

---

## ✅ Testing Checklist

- [x] Database connection works
- [x] User signup creates record in MySQL
- [x] User login verifies credentials
- [x] OTP generation and storage
- [x] OTP verification
- [x] JWT token generation with integer ID
- [x] Protected routes work with JWT
- [x] Error handling for duplicate emails
- [x] Validation errors display correctly

---

## 🚀 Performance Improvements

1. **Connection Pooling**: Reuses connections instead of creating new ones
2. **Indexes**: Optimized queries with proper indexes
3. **Prepared Statements**: Faster query execution
4. **No ORM Overhead**: Direct SQL is faster than ORM abstraction

---

## 🔒 Security Maintained

1. **SQL Injection Protection**: All queries use prepared statements
2. **Password Hashing**: Still using bcrypt (unchanged)
3. **JWT Tokens**: Still secure, now with integer IDs
4. **Input Validation**: Application-level validation (same as before)

---

## 📝 Environment Variables Required

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=payflow_db
JWT_SECRET=your_secret
JWT_EXPIRE=7d
PORT=4000
```

---

## 🎓 Key Learnings

1. **Connection Pooling**: Better than single connections for concurrent requests
2. **Prepared Statements**: Essential for SQL injection protection
3. **Application Validation**: MySQL constraints are basic, need app-level validation
4. **ID Migration**: ObjectId → Integer requires updating all references
5. **Error Codes**: Different error codes between MongoDB and MySQL

---

## 📚 Files Modified Summary

1. ✅ `package.json` - Dependencies
2. ✅ `config/env.js` - Environment variables
3. ✅ `Database/db_connection.js` - Connection logic
4. ✅ `Database/schema.sql` - NEW: Table definitions
5. ✅ `models/user.js` - SQL query functions
6. ✅ `models/otp.js` - SQL query functions
7. ✅ `controllers/authController.js` - Updated queries
8. ✅ `middleware/auth.js` - Updated user lookup
9. ✅ `server.js` - Updated import

---

## 🎉 Migration Complete!

All MongoDB code has been successfully migrated to MySQL. The application now uses:
- ✅ MySQL database with proper schema
- ✅ SQL queries with prepared statements
- ✅ Connection pooling for performance
- ✅ Application-level validation
- ✅ Comprehensive error handling
- ✅ Full documentation

The migration maintains all existing functionality while improving performance and using a relational database structure.
