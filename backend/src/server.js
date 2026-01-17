// WHY IMPORT ENV FROM CONFIG?
// Centralizes environment variable access
// All env variables are validated and processed in one place
// Easier to see what environment variables the app needs
const { env } = require('./config/env.js');

// WHY IMPORT DATABASE CONNECTION?
// We need to connect to database before server starts
// Separate file keeps database logic organized and reusable
const connectDB = require('./Database/db_connection.js');

// WHY EXPRESS?
// Express is the most popular Node.js web framework
// Provides tools for routing, middleware, HTTP request/response handling
// Makes building APIs much easier than using Node.js built-in http module
// Industry standard for Node.js backend development
const express = require('express');

// WHY CREATE APP INSTANCE?
// app is the Express application object
// This is our web server - handles all HTTP requests
// We configure routes, middleware, etc. on this app object
const app = express();

// WHY GET PORT FROM ENV?
// Port number should be configurable (different in dev vs production)
// Environment variables allow changing port without modifying code
// Default fallback is handled in env.js
const port = env.PORT;
// Note: All environment variable logic is centralized in env.js
// This keeps configuration concerns separate from application logic
// Easier to test and maintain

// WHY CONNECT TO DATABASE FIRST?
// Connect to database before starting server
// If connection fails, process exits (handled in db_connection.js)
// Better to fail at startup than have runtime database errors
// 
// WHY NOT AWAIT HERE?
// This is top-level code, not inside an async function
// connectDB() will handle its own async operations internally
// If connection fails, it will exit the process (fail-fast pattern)
connectDB();

// ============================================================================
// MIDDLEWARE - Functions that run between receiving request and sending response
// ============================================================================
// 
// WHY MIDDLEWARE?
// Middleware processes requests before they reach route handlers
// Think of it as a checkpoint that every request must pass through
// Examples: parsing request body, authentication, logging, error handling
// 
// WHY ORDER MATTERS?
// Middleware runs in the order it's added (top to bottom)
// express.json() must come before routes - otherwise routes can't read req.body
// Authentication middleware should come before protected routes

// ============================================================================
// CORS CONFIGURATION - Allow frontend to communicate with backend
// ============================================================================
// 
// WHAT IS CORS?
// CORS = Cross-Origin Resource Sharing
// Browsers have a security rule: JavaScript can only make requests to the same domain
// Example: Frontend on http://localhost:5173 (Vite) cannot request from http://localhost:4000 (backend)
// This is a different domain/port, so browser blocks the request by default
// CORS tells the browser: "Backend gives permission to frontend, allow this request"
// 
// WHY WE NEED CORS?
// Our setup has frontend and backend on different ports (security feature in browsers)
// Without CORS: Frontend gets "blocked by CORS policy" error, requests fail
// With CORS: Backend sends back "Access-Control-Allow-Origin" header, browser allows request
// 
// WHAT WE'RE DOING:
// - origin: 'http://localhost:5173' → Only allows requests from frontend on port 5173
// - credentials: true → Allows cookies/authentication headers to be sent
// - methods: ['GET', 'POST', 'PUT', 'DELETE'] → Which HTTP methods are allowed
// - allowedHeaders: ['Content-Type', 'Authorization'] → Which request headers are allowed
// 
// SECURITY NOTE:
// origin: 'http://localhost:5173' is ONLY for development
// In production, change to your actual frontend domain (e.g., 'https://yoursite.com')
// NEVER use '*' in production - it allows any website to access your API!
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL (running on port 3000)
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed request headers
}));

app.use(express.json());

// WHY EXPRESS.JSON()?
// Parses JSON request bodies (Content-Type: application/json)
// Converts JSON string in request body to JavaScript object
// Without this, req.body will be undefined - you can't read POST/PUT data
// 
// Example: 
// Request: { "email": "user@example.com" } (JSON string)
// After express.json(): req.body = { email: "user@example.com" } (JavaScript object)
// 
// WHY .USE()?
// .use() applies middleware to ALL routes (globally)
// Alternative: .use('/api', middleware) applies only to /api routes
app.use(express.json());

// WHY EXPRESS.URLENCODED()?
// Parses URL-encoded request bodies (Content-Type: application/x-www-form-urlencoded)
// Handles data from HTML forms or older API clients
// extended: true allows parsing nested objects like { user: { name: "John" } }
// extended: false only parses flat objects
// 
// WHY BOTH JSON AND URLENCODED?
// Different clients send data in different formats
// Modern APIs use JSON, but forms use URL-encoded
// Supporting both makes your API more flexible
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// ROUTES - Define which URLs your API responds to
// ============================================================================
// 
// WHY ROUTES?
// Routes map URLs (paths) to functions that handle requests
// Example: app.get('/users') runs a function when someone visits /users
// Different HTTP methods (GET, POST, PUT, DELETE) can use same path for different actions
// 
// HTTP METHODS:
// - GET: Retrieve data (reading)
// - POST: Create new data (creating)
// - PUT/PATCH: Update existing data (updating)
// - DELETE: Remove data (deleting)

// WHY ROOT ENDPOINT (/)?
// Root endpoint serves as API information/health check
// Returns API metadata for client applications
// Helps verify API is running correctly
// Common practice: returns API name, version, status
app.get('/', (req, res) => {
  // WHY RES.JSON()?
  // res.json() sends JSON response and sets Content-Type header automatically
  // Alternative: res.send() sends text, res.sendFile() sends files
  // JSON is standard format for APIs - easy for clients to parse
  res.json({
    success: true,
    message: 'PayFlow Payment Gateway API',
    version: '1.0.0'
  })
})

// ============================================================================
// ROUTE MODULES - Organize routes into separate files
// ============================================================================
// 
// WHY SEPARATE ROUTE FILES?
// Keeps server.js clean and organized (single responsibility)
// Each route file handles related endpoints (e.g., auth, payments, users)
// Easier to maintain: find routes in dedicated files, not one huge file
// Team collaboration: multiple developers can work on different route files
// 
// WHY /api PREFIX?
// /api prefix follows REST API conventions
// Clearly separates API endpoints from other routes
// Allows serving static files (frontend) from root without conflicts
// Example: / serves website, /api/auth serves API
// 
// WHY MOUNT AT /api/auth?
// Mount authRoutes at /api/auth prefix
// All routes in authRoutes.js get the /api/auth prefix automatically
// Routes in authRoutes.js become:
//   POST /api/auth/signup   (from router.post('/signup'))
//   POST /api/auth/login    (from router.post('/login'))  
//   GET  /api/auth/me       (from router.get('/me'))
// 
// This is cleaner than defining full paths in route files
const authRoutes = require('./routes/authRoutes.js');
app.use('/api/auth', authRoutes);

// ============================================================================
// START SERVER - Make server listen for incoming HTTP requests
// ============================================================================
// 
// WHY APP.LISTEN()?
// app.listen() starts the HTTP server and makes it accept connections
// Without this, your server exists but doesn't receive any requests
// 
// WHY PORT VARIABLE?
// Server must listen on a specific port (like 4000)
// Port is where clients connect (http://localhost:4000)
// Different servers can't use the same port simultaneously
// 
// WHY CALLBACK FUNCTION?
// Callback runs AFTER server successfully starts listening
// Confirms server is running - useful for logging and debugging
// The callback is optional but helpful for confirmation
// 
// SERVER STARTUP FLOW:
// 1. Import dependencies (express, config, routes)
// 2. Connect to database (connectDB())
// 3. Configure middleware (express.json, etc.)
// 4. Define routes (app.get, app.use)
// 5. Start listening (app.listen) - THIS IS WHERE SERVER BECOMES ACTIVE
app.listen(port, () => {
  // WHY CONSOLE.LOG?
  // Logs confirmation that server started successfully
  // Shows which port server is listening on
  // First thing you see when starting the application
  // Helpful for debugging: confirms server started correctly
  console.log(`PayFlow API server listening on port ${port}`)
})
