# MongoDB to MySQL Migration Guide

## Overview

This project has been migrated from MongoDB (NoSQL) to MySQL (Relational Database Management System). This document explains all the changes made and how to set up the new MySQL database.

---

## What Changed?

### 1. **Database System**
- **Old**: MongoDB (NoSQL document database)
- **New**: MySQL (Relational database with SQL)

### 2. **Database Driver**
- **Old**: `mongoose` (Mongoose ODM)
- **New**: `mysql2` (MySQL driver with Promise support)

### 3. **Data Structure**
- **Old**: MongoDB documents with `_id` (ObjectId)
- **New**: MySQL tables with `id` (AUTO_INCREMENT integer)

### 4. **Query Language**
- **Old**: Mongoose queries (`User.findOne()`, `User.create()`)
- **New**: SQL queries (`SELECT`, `INSERT`, `UPDATE`)

---

## Files Changed

### 1. **package.json**
- **Removed**: `mongoose` dependency
- **Added**: `mysql2` dependency

### 2. **config/env.js**
- **Removed**: `MONGO_URI` (connection string)
- **Added**: 
  - `DB_HOST` (MySQL server host)
  - `DB_PORT` (MySQL server port, default: 3306)
  - `DB_USER` (MySQL username)
  - `DB_PASSWORD` (MySQL password)
  - `DB_NAME` (Database name)

### 3. **Database/db_connection.js**
- **Completely rewritten** to use MySQL connection pool
- **Old**: `mongoose.connect(env.MONGO_URI)`
- **New**: `mysql.createPool()` with connection parameters

### 4. **Database/schema.sql** (NEW FILE)
- SQL schema file with `CREATE TABLE` statements
- Defines `users` and `otps` tables
- Includes indexes and constraints

### 5. **models/user.js**
- **Completely rewritten** to use SQL queries
- **Old**: Mongoose schema and model
- **New**: SQL query functions (`findUserByEmail()`, `findUserById()`, `createUser()`)

### 6. **models/otp.js**
- **Completely rewritten** to use SQL queries
- **Old**: Mongoose schema and model
- **New**: SQL query functions (`findValidOTP()`, `createOTP()`, `markOTPAsUsed()`)

### 7. **controllers/authController.js**
- Updated all database queries to use SQL functions
- Changed `user._id` to `user.id`
- Updated error handling for MySQL errors (`ER_DUP_ENTRY`)

### 8. **middleware/auth.js**
- Updated to use `findUserById()` SQL function
- Changed `user._id` to `user.id` in JWT tokens

### 9. **server.js**
- Updated import to destructure `connectDB` from db_connection.js

---

## Setup Instructions

### Step 1: Install MySQL

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

**Windows:**
Download MySQL Installer from https://dev.mysql.com/downloads/installer/

### Step 2: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE payflow_db;

# Exit MySQL
exit;
```

### Step 3: Run Schema

```bash
# From project root
mysql -u root -p payflow_db < backend/src/Database/schema.sql
```

Or manually in MySQL client:
```sql
USE payflow_db;
SOURCE backend/src/Database/schema.sql;
```

### Step 4: Update Environment Variables

Create or update `.env` file in `backend/` directory:

```env
# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=payflow_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=4000
```

### Step 5: Install Dependencies

```bash
cd backend
npm install
```

This will install `mysql2` and remove `mongoose` if it was installed.

### Step 6: Start Server

```bash
npm run server
```

You should see:
```
✅ MySQL Database Connected Successfully!
   Host: localhost:3306
   Database: payflow_db
PayFlow API server listening on port 4000
```

---

## Key Differences: MongoDB vs MySQL

### 1. **ID Generation**
- **MongoDB**: ObjectId (24-character hex string)
- **MySQL**: AUTO_INCREMENT integer (1, 2, 3, ...)

### 2. **Queries**
- **MongoDB**: `User.findOne({ Email: email })`
- **MySQL**: `SELECT * FROM users WHERE Email = ?`

### 3. **Connection**
- **MongoDB**: Single connection (`mongoose.connect()`)
- **MySQL**: Connection pool (`mysql.createPool()`)

### 4. **Validation**
- **MongoDB**: Schema-level validation (Mongoose)
- **MySQL**: Application-level validation + database constraints

### 5. **Timestamps**
- **MongoDB**: Automatic `createdAt`/`updatedAt` (Mongoose)
- **MySQL**: `DEFAULT CURRENT_TIMESTAMP` and `ON UPDATE CURRENT_TIMESTAMP`

---

## Testing the Migration

### 1. Test Signup
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "FullName": "John Doe",
    "Email": "john@example.com",
    "Password": "SecurePass123@",
    "ConfirmPassword": "SecurePass123@"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "john@example.com",
    "Password": "SecurePass123@"
  }'
```

### 3. Verify Database
```bash
mysql -u root -p payflow_db

# Check users table
SELECT * FROM users;

# Check otps table
SELECT * FROM otps;
```

---

## Troubleshooting

### Error: "missing required env parameter: DB_USER"
**Solution**: Make sure `.env` file exists with all required variables.

### Error: "Access denied for user"
**Solution**: Check MySQL username and password in `.env` file.

### Error: "Unknown database 'payflow_db'"
**Solution**: Create database first: `CREATE DATABASE payflow_db;`

### Error: "Table 'users' doesn't exist"
**Solution**: Run schema.sql file to create tables.

### Error: "ER_DUP_ENTRY: Duplicate entry"
**Solution**: This is expected for duplicate emails. Use a different email.

---

## Migration Checklist

- [x] Update `package.json` dependencies
- [x] Create `schema.sql` file
- [x] Update `db_connection.js` for MySQL
- [x] Update `env.js` for MySQL parameters
- [x] Convert `user.js` model to SQL
- [x] Convert `otp.js` model to SQL
- [x] Update `authController.js` for SQL
- [x] Update `auth.js` middleware for SQL
- [x] Update `server.js` import
- [x] Create migration documentation

---

## Next Steps

1. **Data Migration** (if you have existing MongoDB data):
   - Export data from MongoDB
   - Transform data format (ObjectId → integer, etc.)
   - Import into MySQL

2. **Testing**:
   - Test all API endpoints
   - Verify authentication flow
   - Check OTP generation and verification

3. **Production Deployment**:
   - Update production `.env` with MySQL credentials
   - Run schema on production database
   - Deploy updated code

---

## Support

If you encounter any issues during migration, check:
1. MySQL server is running
2. Database and tables are created
3. Environment variables are set correctly
4. Dependencies are installed (`npm install`)
