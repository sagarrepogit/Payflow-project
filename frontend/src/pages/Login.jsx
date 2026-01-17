// ============================================================================
// LOGIN PAGE - User login page (Step 1: Email + Password)
// ============================================================================
// 
// WHAT THIS COMPONENT DOES:
// - Displays login form (Email, Password)
// - Sends credentials to backend
// - Backend verifies credentials and generates OTP
// - Redirects to OTP verification page

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginAPI } from '../services/api'
import './Auth.css'

/**
 * Login Component
 * 
 * TWO-STEP LOGIN PROCESS:
 * Step 1 (this component): Verify Email + Password, get OTP
 * Step 2 (VerifyOTP component): Enter OTP to complete login
 */
function Login() {
  const navigate = useNavigate()

  // WHY STORE FORM DATA IN STATE?
  // Tracks Email and Password as user types
  const [formData, setFormData] = useState({
    Email: '',
    Password: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /**
   * Handle Input Change
   * Updates form data and clears errors as user types
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  /**
   * Handle Form Submission
   * 
   * WHAT IT DOES:
   * 1. Validates input
   * 2. Sends Email + Password to backend
   * 3. Backend generates OTP and returns it
   * 4. Navigates to OTP verification page
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Client-side validation
    const newErrors = {}
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = 'Email is invalid'
    }
    if (!formData.Password) {
      newErrors.Password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      // WHY AWAIT LOGIN API?
      // Wait for backend to verify credentials and generate OTP
      const response = await loginAPI(formData)
      
      if (response.data.success) {
        // WHY STORE OTP IN SESSION STORAGE?
        // OTP is returned in response (for testing)
        // Store OTP temporarily to pass to next step
        // sessionStorage: Clears when browser tab closes (more secure than localStorage)
        // Also store email/password for OTP verification step
        sessionStorage.setItem('otpEmail', formData.Email)
        sessionStorage.setItem('otpPassword', formData.Password)
        
        // WHY SHOW OTP IN ALERT? (for testing)
        // In production, OTP would be sent via email
        // For now, show in alert so user can copy it
        alert(`OTP: ${response.data.data.otp}\n\nCopy this OTP to verify your login.`)
        
        // WHY NAVIGATE TO VERIFY OTP?
        // Step 1 complete - now user needs to enter OTP
        navigate('/verify-otp')
      }
    } catch (error) {
      // WHY HANDLE ERROR?
      // Show error message if credentials are wrong
      // Don't reveal if email exists (security best practice)
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else {
        setErrors({ general: 'Login failed. Please check your credentials.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              className={errors.Email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.Email && <span className="error-text">{errors.Email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="Password">Password</label>
            <input
              type="password"
              id="Password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              className={errors.Password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.Password && <span className="error-text">{errors.Password}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="auth-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
