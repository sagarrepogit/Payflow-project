// ============================================================================
// MAIN ENTRY POINT - This is where the React app starts
// ============================================================================
// 
// WHAT IS THIS FILE?
// This is the entry point of the React application
// First JavaScript file that runs when page loads
// Renders the React app into the HTML document

// WHY IMPORT REACT AND REACT-DOM?
// React: Core library for building user interfaces
// ReactDOM: Provides methods to render React components to the DOM
// React 18 uses ReactDOM from 'react-dom/client' for new rendering API
import React from 'react'
import ReactDOM from 'react-dom/client'

// WHY IMPORT APP COMPONENT?
// App is the root component of our application
// All other components are nested inside App
import App from './App.jsx'

// WHY IMPORT CSS?
// Global styles applied to entire application
// Resets browser defaults and sets base styles
import './index.css'

// WHY ROOT RENDER?
// React 18 uses createRoot API (better than ReactDOM.render)
// Gets the root div element from index.html
// Renders the App component inside it
// 
// WHAT IS STRICT MODE?
// <React.StrictMode> enables extra checks and warnings
// Helps find potential problems during development
// Only runs in development, not in production builds
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
