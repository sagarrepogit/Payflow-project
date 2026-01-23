-- ============================================================================
-- DATABASE SCHEMA - MySQL Table Definitions
-- ============================================================================
-- 
-- This file contains SQL CREATE TABLE statements for the PayFlow application
-- Run this file to create the database tables
-- 
-- HOW TO USE:
-- 1. Create database: CREATE DATABASE payflow_db;
-- 2. Run this file: mysql -u root -p payflow_db < schema.sql
-- 3. Or execute statements in MySQL client/workbench

-- ============================================================================
-- USERS TABLE - Stores user account information
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(254) NOT NULL UNIQUE,
    INDEX idx_email (Email),
    Password VARCHAR(255) NOT NULL,
    passwordChangedAt TIMESTAMP NULL DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- OTP (One-Time Password) TABLE - Stores OTPs for two-factor authentication
-- ============================================================================

CREATE TABLE IF NOT EXISTS otps (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(254) NOT NULL,
    INDEX idx_otp_email (Email),
    OTP VARCHAR(6) NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    INDEX idx_otp_expires (expiresAt),
    used TINYINT(1) NOT NULL DEFAULT 0,
    INDEX idx_otp_used (used),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_email_used (Email, used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
