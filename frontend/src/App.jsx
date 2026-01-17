// ============================================================================
// APP COMPONENT - Root component that contains entire application
// ============================================================================
// 
// WHAT IS A REACT COMPONENT?
// Components are reusable pieces of UI (like functions but for HTML)
// They return JSX (JavaScript XML) which looks like HTML
// Components can have state (data that changes) and props (data passed from parent)
// 
// WHY FUNCTION COMPONENTS?
// Modern React uses function components (easier to understand than class components)
// Function components are simpler, use less code, and support React Hooks
// Industry standard - most React apps use function components now

import React from 'react'
// WHY REACT ROUTER?
// React Router handles navigation between different pages
// Single Page Application (SPA) - no page reloads, feels like native app
// BrowserRouter enables routing, Routes defines routes, Route defines single route
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// WHY IMPORT COMPONENTS?
// Import all page components we'll use in routes
import Signup from './pages/Signup'
import Login from './pages/Login'
import VerifyOTP from './pages/VerifyOTP'
import Dashboard from './pages/Dashboard'

// WHY IMPORT AUTH CONTEXT?
// AuthContext provides authentication state to all components
// Allows any component to check if user is logged in
// Prevents unauthorized access to protected routes
import { AuthProvider } from './context/AuthContext'

/**
 * App Component - Main application component
 * 
 * WHAT IT DOES:
 * 1. Sets up routing (which URL shows which page)
 * 2. Provides authentication context to all child components
 * 3. Handles navigation between pages
 * 
 * ROUTING EXPLANATION:
 * - /signup → Signup page (public)
 * - /login → Login page (public)
 * - /verify-otp → OTP verification page (public)
 * - /dashboard → Dashboard page (protected - requires login)
 * - / → Redirects to /login if not logged in, /dashboard if logged in
 */
function App() {
  return (
    // WHY AUTH PROVIDER?
    // Wraps entire app so all components can access auth state
    // Provides login status, user data, login/logout functions
    <AuthProvider>
      {/* WHY BROWSER ROUTER?
          Enables routing in React app
          Uses browser's history API for navigation
          Allows going back/forward with browser buttons */}
      <BrowserRouter>
        {/* WHY ROUTES?
            Container for all route definitions
            React Router matches URL to route and renders appropriate component */}
        <Routes>
          {/* WHY ROUTE COMPONENT?
              Defines which component to show for each URL path
              path="/signup" means this route matches /signup URL
              element={<Signup />} means render Signup component */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* WHY PROTECTED ROUTE?
              Dashboard requires user to be logged in
              ProtectedRoute component checks authentication before rendering */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* WHY NAVIGATE COMPONENT?
              Redirects user to different route
              Default route (/) redirects to /login
              Replace prevents adding to browser history (can't go back) */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

// WHY EXPORT DEFAULT?
// Allows other files to import App component
// "default" means this is the main export from this file
export default App
