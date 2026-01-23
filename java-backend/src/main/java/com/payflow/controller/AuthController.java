package com.payflow.controller;

// ============================================================================
// AUTH CONTROLLER - REST API Endpoints for Authentication
// ============================================================================
// 
// WHAT IS A CONTROLLER?
// - Handles HTTP requests and responses
// - Maps URLs to service methods
// - Similar to Express routes in Node.js
// 
// MIGRATION FROM NODE.JS:
// - routes/authRoutes.js + controllers/authController.js
// - → AuthController class with @RestController

import com.payflow.dto.*;
import com.payflow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * 
 * MIGRATION FROM NODE.JS:
 * - router.post('/signup', signup) → @PostMapping("/signup")
 * - router.post('/login', login) → @PostMapping("/login")
 * - router.post('/verify-otp', verifyOTP) → @PostMapping("/verify-otp")
 * - router.get('/me', authenticate, getCurrentUser) → @GetMapping("/me")
 * 
 * @RestController: Combines @Controller + @ResponseBody
 * - @Controller: Marks class as Spring MVC controller
 * - @ResponseBody: Converts return values to JSON automatically
 * 
 * @RequestMapping: Base path for all endpoints in this controller
 * All endpoints will be prefixed with /api/auth
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    /**
     * Auth Service
     * 
     * MIGRATION FROM NODE.JS:
     * - Direct function calls in controller
     * - → Service layer (separation of concerns)
     * 
     * @Autowired: Spring automatically injects AuthService instance
     */
    @Autowired
    private AuthService authService;
    
    /**
     * Signup Endpoint
     * 
     * MIGRATION FROM NODE.JS:
     * - router.post('/signup', signup)
     * - → @PostMapping("/signup")
     * 
     * @PostMapping: Handles POST requests to /api/auth/signup
     * @Valid: Triggers validation on SignupRequest (Bean Validation)
     * @RequestBody: Converts JSON request body to SignupRequest object
     * 
     * @param request Signup request DTO (validated automatically)
     * @return ResponseEntity with ApiResponse containing SignupResponse
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignupResponse>> signup(@Valid @RequestBody SignupRequest request) {
        try {
            SignupResponse response = authService.signup(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", response));
        } catch (RuntimeException e) {
            // Handle business logic errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            // Handle unexpected errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating user account"));
        }
    }
    
    /**
     * Login Endpoint (Step 1: Generate OTP)
     * 
     * MIGRATION FROM NODE.JS:
     * - router.post('/login', login)
     * - → @PostMapping("/login")
     * 
     * @param request Login request DTO
     * @return ResponseEntity with ApiResponse containing LoginResponse
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(
                    "Credentials verified. OTP generated. Please verify OTP to complete login.",
                    response
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error during login"));
        }
    }
    
    /**
     * Verify OTP Endpoint (Step 2: Complete Login)
     * 
     * MIGRATION FROM NODE.JS:
     * - router.post('/verify-otp', verifyOTP)
     * - → @PostMapping("/verify-otp")
     * 
     * @param request Verify OTP request DTO
     * @return ResponseEntity with ApiResponse containing SignupResponse
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<SignupResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            SignupResponse response = authService.verifyOtp(request);
            return ResponseEntity.ok(ApiResponse.success(
                    "OTP verified successfully. Login complete.",
                    response
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error verifying OTP"));
        }
    }
    
    /**
     * Get Current User Endpoint (Protected)
     * 
     * MIGRATION FROM NODE.JS:
     * - router.get('/me', authenticate, getCurrentUser)
     * - → @GetMapping("/me") with @RequestHeader for token
     * 
     * NOTE: In production, use Spring Security filter instead of manual token extraction
     * This is simplified for learning purposes
     */
    @Autowired
    private com.payflow.util.JwtUtil jwtUtil;
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            // Extract token from "Bearer <token>"
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Access denied. No token provided."));
            }
            
            String token = authorization.substring(7); // Remove "Bearer " prefix
            
            // Validate token
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid token."));
            }
            
            // Get user ID from token
            Long userId = jwtUtil.getUserIdFromToken(token);
            
            // Get user data
            UserResponse userResponse = authService.getCurrentUser(userId);
            
            return ResponseEntity.ok(ApiResponse.success("User data retrieved", userResponse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching user data"));
        }
    }
}
