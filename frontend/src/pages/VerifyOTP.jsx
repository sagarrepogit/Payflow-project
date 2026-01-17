// ============================================================================
// VERIFY OTP PAGE - OTP verification page (Step 2: Complete login)
// ============================================================================
// 
// WHAT THIS COMPONENT DOES:
// - Displays OTP input form
// - Retrieves Email and Password from sessionStorage (from login step)
// - Sends Email, Password, and OTP to backend
// - Stores JWT token and redirects to dashboard on success

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyOTP as verifyOTPAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

/**
 * VerifyOTP Component
 * 
 * WHY THIS COMPONENT EXISTS:
 * Two-step authentication for enhanced security
 * User must verify OTP even after entering correct password
 */
function VerifyOTP() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // WHY USE EFFECT ON MOUNT?
  // Check if Email and Password exist in sessionStorage
  // If not, redirect to login (user must complete step 1 first)
  useEffect(() => {
    // WHY GET FROM SESSION STORAGE?
    // Email and Password were stored in login step
    // sessionStorage persists across page navigation but clears when tab closes
    const storedEmail = sessionStorage.getItem('otpEmail')
    const storedPassword = sessionStorage.getItem('otpPassword')
    
    if (!storedEmail || !storedPassword) {
      // WHY REDIRECT IF NO DATA?
      // User must complete login step first before verifying OTP
      // Prevents direct access to OTP page without logging in
      navigate('/login')
    } else {
      setEmail(storedEmail)
      setPassword(storedPassword)
    }
  }, [navigate])

  /**
   * Handle OTP Input Change
   * 
   * WHY LIMIT TO 6 DIGITS?
   * OTP is always 6 digits (backend requirement)
   * Prevents user from entering invalid OTP length
   */
  const handleOtpChange = (e) => {
    const value = e.target.value
    
    // WHY REGEX TEST?
    // Only allow digits (0-9)
    // Prevents entering letters or special characters
    if (value === '' || /^\d+$/.test(value)) {
      // WHY LIMIT TO 6 CHARACTERS?
      // OTP is exactly 6 digits
      if (value.length <= 6) {
        setOtp(value)
        if (errors.otp) {
          setErrors(prev => ({ ...prev, otp: '' }))
        }
      }
    }
  }

  /**
   * Handle Form Submission
   * 
   * WHAT IT DOES:
   * 1. Validates OTP (must be 6 digits)
   * 2. Sends Email, Password, OTP to backend
   * 3. Backend verifies OTP and returns JWT token
   * 4. Stores token and redirects to dashboard
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // WHY VALIDATE OTP LENGTH?
    // OTP must be exactly 6 digits
    if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' })
      return
    }

    setLoading(true)

    try {
      // WHY SEND EMAIL AND PASSWORD AGAIN?
      // Security: Re-verify credentials to ensure OTP is used by correct user
      // Prevents OTP misuse if intercepted
      const response = await verifyOTPAPI({
        Email: email,
        Password: password,
        OTP: otp
      })
      
      if (response.data.success) {
        // WHY CLEAR SESSION STORAGE?
        // Remove sensitive data (password) from storage
        // Don't keep password in storage longer than necessary
        sessionStorage.removeItem('otpEmail')
        sessionStorage.removeItem('otpPassword')
        
        // WHY STORE TOKEN?
        // Token proves user is authenticated
        // Needed for accessing protected routes
        login(response.data.data.token)
        
        // WHY NAVIGATE TO DASHBOARD?
        // Login complete - redirect to main application
        navigate('/dashboard')
      }
    } catch (error) {
      // WHY HANDLE ERROR?
      // Show error if OTP is invalid or expired
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else {
        setErrors({ general: 'Invalid or expired OTP. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify OTP</h2>
        <p className="otp-info">Enter the 6-digit OTP sent to your email</p>
        
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              className={errors.otp ? 'error' : ''}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              autoFocus
            />
            {errors.otp && <span className="error-text">{errors.otp}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <p className="auth-link">
            <a href="/login">Back to Login</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default VerifyOTP
