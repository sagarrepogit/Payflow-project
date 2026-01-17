// ============================================================================
// DASHBOARD PAGE - Main application dashboard (protected route)
// ============================================================================
// 
// WHAT THIS COMPONENT DOES:
// - Displays user dashboard after login
// - Shows user information
// - Provides logout functionality
// - Only accessible when user is logged in

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCurrentUser } from '../services/api'
import './Dashboard.css'

/**
 * Dashboard Component
 * 
 * WHY PROTECTED ROUTE?
 * Only authenticated users should see dashboard
 * Contains sensitive user information
 */
function Dashboard() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, token } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // WHY USE EFFECT?
  // Fetch user data when component mounts
  // Redirect to login if not authenticated
  useEffect(() => {
    // WHY CHECK AUTHENTICATION?
    // Don't allow access without valid token
    if (!isAuthenticated || !token) {
      navigate('/login')
      return
    }

    // WHY FETCH USER DATA?
    // Get current user's profile information
    // Display user name, email, etc. on dashboard
    const fetchUser = async () => {
      try {
        // WHY PASS TOKEN EXPLICITLY?
        // Ensures Authorization header is set with the token
        // Even if axios defaults haven't updated yet, request will have token
        // Prevents "No token provided" errors that can happen on rapid navigation
        const response = await getCurrentUser(token)
        if (response.data.success) {
          setUser(response.data.data.user)
        }
      } catch (error) {
        // WHY HANDLE ERROR?
        // Token might be expired or invalid
        // Logout user and redirect to login
        // 401 Unauthorized = token is missing or invalid
        if (error.response?.status === 401) {
          console.error('Token invalid or expired:', error.response.data?.message)
          logout()
          navigate('/login')
        } else {
          console.error('Error fetching user:', error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [isAuthenticated, token, navigate, logout])

  // WHY HANDLE LOGOUT?
  // Clears token and redirects to login
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // WHY SHOW LOADING STATE?
  // While fetching user data, show loading message
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* WHY HEADER?
          Shows user info and logout button
          Consistent navigation across app */}
      <header className="dashboard-header">
        <div className="logo">
          <h1>PayFlow</h1>
          <span>e-wallet</span>
        </div>
        <div className="user-info">
          <span>{user?.Email || 'User'} / BACK OFFICE</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* WHY WELCOME SECTION?
            Personalizes dashboard experience
            Shows user's name and account info */}
        <div className="welcome-card">
          <h2>Welcome, {user?.FullName || 'User'}!</h2>
          <p>Email: {user?.Email}</p>
          <p>Account Created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>

        {/* WHY STATS SECTION?
            Displays key metrics (placeholder for future features)
            Matches design theme from images */}
        <div className="stats-section">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Status</h4>
              <p className="stat-value">Active</p>
            </div>
            <div className="stat-card">
              <h4>Account Type</h4>
              <p className="stat-value">Standard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
