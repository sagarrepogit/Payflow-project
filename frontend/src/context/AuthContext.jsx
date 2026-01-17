// ============================================================================
// AUTH CONTEXT - Global authentication state management
// ============================================================================
// 
// WHAT IS CONTEXT?
// React Context provides a way to share data across components
// Without Context: must pass data through props at every level (prop drilling)
// With Context: any component can access data directly (cleaner code)
// 
// WHY USE CONTEXT FOR AUTHENTICATION?
// - Login status needed in many components
// - Avoids prop drilling through multiple component layers
// - Single source of truth for auth state
// - Easy to check login status anywhere in app

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// WHY CREATE CONTEXT?
// Creates a context object for authentication
// This context will hold: user data, login status, login/logout functions
const AuthContext = createContext(null)

/**
 * AuthProvider Component
 * 
 * WHAT IT DOES:
 * - Manages authentication state (is user logged in?)
 * - Stores JWT token in localStorage (persists across page refreshes)
 * - Provides login, logout, and token management functions
 * - Checks if user is logged in on app startup
 * 
 * WHY PROVIDER COMPONENT?
 * - Wraps app to provide auth data to all children
 * - Children access auth via useAuth() hook
 */
export function AuthProvider({ children }) {
  // WHY USE STATE FOR TOKEN?
  // useState stores the JWT token in component memory
  // When token changes, components using this context re-render
  // Initial value: get token from localStorage if it exists
  const [token, setToken] = useState(() => {
    // WHY READ FROM LOCALSTORAGE ON INITIAL LOAD?
    // localStorage persists data across page refreshes
    // If user refreshes page, they stay logged in (better UX)
    // Check if token exists in localStorage first
    return localStorage.getItem('token') || null
  })

  // WHY USE STATE FOR LOADING?
  // Tracks if we're still checking authentication status
  // Prevents showing login form while checking if user is already logged in
  const [loading, setLoading] = useState(true)

  // WHY USE EFFECT?
  // Runs code when component mounts (app starts)
  // Checks if stored token is still valid
  useEffect(() => {
    // WHY CHECK TOKEN ON STARTUP?
    // Validates token hasn't expired
    // If valid, user stays logged in
    // If invalid, clears token and shows login
    if (token) {
      // Set axios default header for authenticated requests
      // WHY SET DEFAULT HEADER?
      // All API requests will include Authorization header automatically
      // Don't need to add it to every axios request manually
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      // WHY REMOVE HEADER IF NO TOKEN?
      // Prevents sending invalid Authorization header
      delete axios.defaults.headers.common['Authorization']
    }
    
    // WHY SET LOADING FALSE?
    // Finished checking authentication
    // App can now render (won't show loading spinner)
    setLoading(false)
  }, [token]) // WHY TOKEN DEPENDENCY? Re-run if token changes

  /**
   * Login Function
   * 
   * WHAT IT DOES:
   * - Stores JWT token in state and localStorage
   * - Sets axios default Authorization header
   * - Allows user to access protected routes
   * 
   * WHY SAVE TOKEN IN MULTIPLE PLACES?
   * - State: For immediate use in current session
   * - localStorage: Persists across page refreshes
   * - Axios header: Automatically included in API requests
   */
  const login = (newToken) => {
    setToken(newToken) // Update state (triggers re-render of components)
    localStorage.setItem('token', newToken) // Persist to localStorage
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}` // Set API header
  }

  /**
   * Logout Function
   * 
   * WHAT IT DOES:
   * - Removes token from state and localStorage
   * - Clears axios Authorization header
   * - Redirects user to login page
   */
  const logout = () => {
    setToken(null) // Clear token from state
    localStorage.removeItem('token') // Remove from localStorage
    delete axios.defaults.headers.common['Authorization'] // Clear API header
  }

  // WHY CREATE VALUE OBJECT?
  // Object containing all auth-related data and functions
  // Components using this context get access to these values
  const value = {
    token, // Current JWT token (null if not logged in)
    isAuthenticated: !!token, // WHY DOUBLE NEGATION? Converts token to boolean (true if token exists)
    login, // Function to log user in
    logout, // Function to log user out
    loading // Loading state (true while checking auth status)
  }

  // WHY PROVIDE VALUE?
  // Makes value available to all child components
  // Any component can use useAuth() hook to access these values
  // {children} are all components wrapped by AuthProvider (entire app)
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth Hook
 * 
 * WHAT IT DOES:
 * - Custom hook to access authentication context
 * - Throws error if used outside AuthProvider (prevents mistakes)
 * - Returns auth state and functions
 * 
 * WHY CUSTOM HOOK?
 * - Easier to use than useContext(AuthContext) every time
 * - Can add validation/error handling in one place
 * - Standard pattern in React apps
 * 
 * USAGE:
 * const { isAuthenticated, login, logout } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  // WHY CHECK IF CONTEXT EXISTS?
  // Prevents using useAuth() outside AuthProvider
  // Throws helpful error message if used incorrectly
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}
