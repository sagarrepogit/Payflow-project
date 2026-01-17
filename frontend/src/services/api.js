// ============================================================================
// API SERVICE - Handles all communication with backend
// ============================================================================
// 
// WHAT IS THIS FILE?
// Centralized API service layer for making HTTP requests to backend
// All API calls go through this file (single source of truth)
// 
// WHY SEPARATE API FILE?
// - Reusable: All components use same API functions
// - Maintainable: Change API URL in one place
// - Testable: Easy to mock API calls for testing
// - Organized: All backend communication in one file

import axios from 'axios'

// WHY AXIOS INSTANCE?
// Creates configured axios instance with base settings
// Base URL: Backend API server URL
// Timeout: Request fails if no response in 10 seconds (prevents hanging)
// Headers: Sets default Content-Type for JSON requests
const api = axios.create({
  baseURL: 'http://localhost:4001/api', // WHY BASE URL? All API calls start with this URL (backend runs on port 4001)
  timeout: 10000, // WHY TIMEOUT? Prevents requests from hanging forever (10 seconds)
  headers: {
    'Content-Type': 'application/json' // WHY THIS HEADER? Tells backend we're sending JSON data
  }
})

// ============================================================================
// AUTHENTICATION API FUNCTIONS
// ============================================================================

/**
 * Signup API Call
 * 
 * WHAT IT DOES:
 * Sends user registration data to backend
 * Returns user data and JWT token if successful
 * 
 * @param {Object} userData - Registration data
 * @param {string} userData.FullName - User's full name
 * @param {string} userData.Email - User's email address
 * @param {string} userData.Password - User's password
 * @param {string} userData.ConfirmPassword - Password confirmation
 * @returns {Promise} Promise that resolves with response data
 */
export const signup = async (userData) => {
  // WHY POST REQUEST?
  // POST is for creating new resources (new user account)
  // GET is for reading, POST is for creating/updating
  // 
  // WHAT HAPPENS:
  // 1. Sends POST request to /api/auth/signup
  // 2. Backend validates data and creates user
  // 3. Returns response with user data and token
  return api.post('/auth/signup', userData)
}

/**
 * Login API Call - Step 1: Verify Credentials and Get OTP
 * 
 * WHAT IT DOES:
 * Sends email and password to backend
 * Backend verifies credentials and generates OTP
 * Returns OTP code (for testing - in production, sent via email)
 * 
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.Email - User's email
 * @param {string} credentials.Password - User's password
 * @returns {Promise} Promise that resolves with OTP response
 */
export const login = async (credentials) => {
  // WHY POST REQUEST?
  // Login is an action (not just reading data)
  // Creates session/token, so POST is appropriate
  // 
  // RESPONSE STRUCTURE:
  // {
  //   success: true,
  //   message: "...",
  //   data: {
  //     otp: "123456",
  //     expiresIn: "10 minutes"
  //   }
  // }
  return api.post('/auth/login', credentials)
}

/**
 * Verify OTP API Call - Step 2: Complete Login
 * 
 * WHAT IT DOES:
 * Sends email, password (re-verify), and OTP to backend
 * Backend validates OTP and returns JWT token
 * 
 * @param {Object} otpData - OTP verification data
 * @param {string} otpData.Email - User's email
 * @param {string} otpData.Password - User's password (re-verified)
 * @param {string} otpData.OTP - 6-digit OTP code
 * @returns {Promise} Promise that resolves with token response
 */
export const verifyOTP = async (otpData) => {
  // WHY RE-VERIFY PASSWORD?
  // Security: Ensures person entering OTP is same person who requested login
  // Prevents OTP misuse if someone intercepts OTP
  // 
  // RESPONSE STRUCTURE:
  // {
  //   success: true,
  //   message: "...",
  //   data: {
  //     user: { ... },
  //     token: "eyJhbGciOiJIUzI1NiIs..."
  //   }
  // }
  return api.post('/auth/verify-otp', otpData)
}

/**
 * Get Current User API Call
 * 
 * WHAT IT DOES:
 * Gets authenticated user's profile information
 * Requires valid JWT token in Authorization header
 * Used to check if user is logged in and get user data
 * 
 * @param {string} token - Optional JWT token to use for request
 * @returns {Promise} Promise that resolves with user data
 */
export const getCurrentUser = async (token) => {
  // WHY GET REQUEST?
  // Reading user data (not creating or updating)
  // GET requests are for fetching data
  // 
  // WHY TOKEN PARAMETER?
  // Allows passing token explicitly
  // Ensures request has Authorization header even if axios defaults aren't set yet
  // Prevents "No token provided" errors on dashboard load
  const config = {}
  if (token) {
    // WHY SET AUTHORIZATION HEADER?
    // Explicitly adds token to this specific request
    // Ensures token is sent even if axios default headers aren't ready
    // Fixes race condition when token is just being saved
    config.headers = {
      'Authorization': `Bearer ${token}`
    }
  }
  
  return api.get('/auth/me', config)
}

// WHY EXPORT ALL FUNCTIONS?
// Allows components to import only what they need
// import { signup, login } from './services/api'
export default api
