// ============================================================================
// VITE CONFIGURATION - Build tool configuration for React frontend
// ============================================================================
// 
// WHAT IS VITE?
// Vite is a fast build tool for modern web development
// Faster than Create React App - instant server start, fast hot reload
// Uses native ES modules in development (no bundling needed)
// Optimized production builds with Rollup
// 
// WHY VITE INSTEAD OF CREATE REACT APP?
// - Much faster development server startup
// - Faster hot module replacement (HMR)
// - Simpler configuration
// - Better performance out of the box
// - Modern tooling with better DX (Developer Experience)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// WHY DEFINE CONFIG?
// Vite configuration object
// Customizes how Vite builds and serves the application
export default defineConfig({
  // WHY PLUGINS?
  // Plugins extend Vite's functionality
  // @vitejs/plugin-react enables React support (JSX, Fast Refresh, etc.)
  plugins: [react()],
  
  // WHY SERVER CONFIG?
  // Development server configuration
  server: {
    port: 3000, // Port where dev server runs (http://localhost:3000)
    proxy: {
      // WHY PROXY?
      // Proxies API requests to backend server
      // When frontend calls /api/*, it forwards to backend at localhost:4000
      // Solves CORS issues - browser thinks request goes to same origin
      '/api': {
        target: 'http://localhost:4000', // Backend server URL
        changeOrigin: true, // Changes origin header to match target
        // No need to rewrite - proxy forwards /api to /api on backend
      }
    }
  }
})
