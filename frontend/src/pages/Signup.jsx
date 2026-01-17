// ============================================================================
// SIGNUP PAGE - User registration page
// ============================================================================
// 
// WHAT THIS COMPONENT DOES:
// - Displays signup form (FullName, Email, Password, ConfirmPassword)
// - Validates user input
// - Sends data to backend API
// - Handles success/error responses
// - Redirects to dashboard after successful signup

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup as signupAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css' // Shared styles for auth pages

/**
 * Signup Component
 * 
 * REACT HOOKS EXPLAINED:
 * - useState: Stores form data and state (errors, loading)
 * - useNavigate: Programmatic navigation (redirect after signup)
 * - useAuth: Access authentication context (login function)
 */
function Signup() {
  // WHY USE NAVIGATE?
  // Allows programmatic navigation (redirecting user after signup)
  // navigate('/dashboard') redirects to dashboard page
  const navigate = useNavigate()
  
  // WHY USE AUTH CONTEXT?
  // Need login function to store token after successful signup
  // User is automatically logged in after registration
  const { login } = useAuth()

  // WHY USE STATE FOR FORM DATA?
  // Stores form field values (FullName, Email, Password, ConfirmPassword)
  // When user types, state updates, component re-renders with new values
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    Password: '',
    ConfirmPassword: ''
  })

  // WHY USE STATE FOR ERRORS?
  // Stores validation error messages
  // Empty initially, populated if validation or API call fails
  const [errors, setErrors] = useState({})

  // WHY USE STATE FOR LOADING?
  // Tracks if signup request is in progress
  // Shows loading spinner/disabled button while processing
  const [loading, setLoading] = useState(false)

  /**
   * Handle Input Change
   * 
   * WHAT IT DOES:
   * Updates formData state when user types in input fields
   * 
   * WHY SPREAD OPERATOR (...)?
   * Copies existing formData, then updates only the changed field
   * Prevents losing other field values when updating one field
   */
  const handleChange = (e) => {
    const { name, value } = e.target // WHY DESTRUCTURE? Extracts field name and value from event
    setFormData(prev => ({
      ...prev, // Copy all existing fields
      [name]: value // Update only the field that changed (dynamic property name)
    }))
    
    // WHY CLEAR ERROR ON CHANGE?
    // When user starts typing again, clear previous error message
    // Provides immediate feedback - errors disappear as user fixes them
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '' // Clear error for this field
      }))
    }
  }

  /**
   * Handle Form Submission
   * 
   * WHAT IT DOES:
   * 1. Validates form data
   * 2. Sends data to backend API
   * 3. Stores token and redirects on success
   * 4. Shows errors on failure
   */
  const handleSubmit = async (e) => {
    e.preventDefault() // WHY PREVENT DEFAULT? Stops form from submitting normally (which would reload page)
    
    // WHY CLEAR PREVIOUS ERRORS?
    // Start fresh - don't show old errors from previous submission
    setErrors({})
    
    // Client-side validation
    const newErrors = {}
    
    // WHY VALIDATE ON CLIENT?
    // Provides immediate feedback (no need to wait for server)
    // Better UX - user sees errors instantly
    if (!formData.FullName.trim()) {
      newErrors.FullName = 'Full Name is required'
    }
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) { // WHY REGEX? Basic email format validation
      newErrors.Email = 'Email is invalid'
    }
    if (!formData.Password) {
      newErrors.Password = 'Password is required'
    } else if (formData.Password.length < 8) {
      newErrors.Password = 'Password must be at least 8 characters'
    }
    if (formData.Password !== formData.ConfirmPassword) {
      newErrors.ConfirmPassword = 'Passwords do not match'
    }

    // WHY CHECK FOR ERRORS BEFORE API CALL?
    // Don't make API request if client-side validation fails
    // Saves network request, provides immediate feedback
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // WHY SET LOADING TRUE?
    // Shows loading state (disable button, show spinner)
    // Prevents multiple submissions while request is processing
    setLoading(true)

    try {
      // WHY TRY-CATCH?
      // API calls can fail (network error, server error, etc.)
      // try-catch handles errors gracefully without crashing app
      
      // WHY AWAIT?
      // Wait for API response before continuing
      // API call is asynchronous (takes time), await pauses until it completes
      const response = await signupAPI(formData)
      
      // WHY CHECK RESPONSE.DATA.SUCCESS?
      // Backend returns { success: true/false } to indicate success/failure
      // Even if HTTP status is 200, backend might return success: false
      if (response.data.success) {
        // WHY STORE TOKEN?
        // Token proves user is authenticated
        // Needed for accessing protected routes and API calls
        login(response.data.data.token)
        
        // WHY NAVIGATE TO DASHBOARD?
        // Redirect user to dashboard after successful signup
        // User is now logged in and can access protected pages
        navigate('/dashboard')
      }
    } catch (error) {
      // WHY HANDLE ERROR?
      // API call failed - show error message to user
      // Don't let app crash - handle error gracefully
      
      // WHY CHECK ERROR.RESPONSE?
      // Axios wraps errors - error.response contains server response
      // error.response.data contains error message from backend
      if (error.response?.data?.errors) {
        // WHY HANDLE VALIDATION ERRORS?
        // Backend might return multiple validation errors
        // Convert array of errors to object keyed by field name
        const backendErrors = {}
        // If errors is array, convert to object format
        // Otherwise, use as is
        if (Array.isArray(error.response.data.errors)) {
          // Handle array of error messages
          setErrors({ general: error.response.data.errors.join(', ') })
        } else {
          setErrors({ general: error.response.data.message || 'Signup failed' })
        }
      } else {
        // WHY GENERAL ERROR MESSAGE?
        // Network errors, server errors, etc.
        // Show generic message if specific error not available
        setErrors({ general: error.response?.data?.message || 'An error occurred. Please try again.' })
      }
    } finally {
      // WHY FINALLY BLOCK?
      // Always runs after try/catch (whether success or error)
      // Resets loading state so user can try again
      setLoading(false)
    }
  }

  // WHY RETURN JSX?
  // Component must return JSX (JavaScript XML) to render HTML
  // JSX looks like HTML but is JavaScript - allows embedding variables/expressions
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* WHY H2 TAG?
            Semantic HTML - h2 indicates heading
            Screen readers understand structure better */}
        <h2>Create Account</h2>
        
        {/* WHY FORM ELEMENT?
            Semantic HTML - indicates this is a form
            Allows Enter key to submit form
            Provides form validation features */}
        <form onSubmit={handleSubmit}>
          {/* WHY GENERAL ERROR DISPLAY?
              Shows API errors (not field-specific)
              Displayed at top of form for visibility */}
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          {/* Full Name Input */}
          <div className="form-group">
            <label htmlFor="FullName">Full Name</label>
            <input
              type="text"
              id="FullName"
              name="FullName"
              value={formData.FullName}
              onChange={handleChange}
              className={errors.FullName ? 'error' : ''} // WHY CONDITIONAL CLASS? Applies error styling if field has error
              placeholder="Enter your full name"
            />
            {errors.FullName && <span className="error-text">{errors.FullName}</span>}
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="Password">Password</label>
            <input
              type="password"
              id="Password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              className={errors.Password ? 'error' : ''}
              placeholder="Enter password"
            />
            {errors.Password && <span className="error-text">{errors.Password}</span>}
          </div>

          {/* Confirm Password Input */}
          <div className="form-group">
            <label htmlFor="ConfirmPassword">Confirm Password</label>
            <input
              type="password"
              id="ConfirmPassword"
              name="ConfirmPassword"
              value={formData.ConfirmPassword}
              onChange={handleChange}
              className={errors.ConfirmPassword ? 'error' : ''}
              placeholder="Confirm password"
            />
            {errors.ConfirmPassword && <span className="error-text">{errors.ConfirmPassword}</span>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {/* WHY LINK TO LOGIN?
              User might already have account
              Provides navigation to login page */}
          <p className="auth-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
