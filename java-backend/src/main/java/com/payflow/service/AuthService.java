package com.payflow.service;

// ============================================================================
// AUTH SERVICE - Business Logic for Authentication
// ============================================================================
// 
// WHAT IS A SERVICE?
// - Contains business logic (not just database operations)
// - Coordinates between repositories, utilities, and controllers
// - Similar to controller logic in Node.js, but separated into service layer
// 
// MIGRATION FROM NODE.JS:
// - controllers/authController.js business logic → AuthService class
// - Separation: Controller handles HTTP, Service handles business logic

import com.payflow.dto.*;
import com.payflow.entity.Otp;
import com.payflow.entity.User;
import com.payflow.repository.OtpRepository;
import com.payflow.repository.UserRepository;
import com.payflow.util.JwtUtil;
import com.payflow.util.OtpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Authentication Service
 * 
 * MIGRATION FROM NODE.JS:
 * - signup() controller → signup() service method
 * - login() controller → login() service method
 * - verifyOTP() controller → verifyOtp() service method
 * 
 * @Service: Marks class as a service (business logic layer)
 * Spring manages this as a bean
 */
@Service
public class AuthService {
    
    /**
     * User Repository
     * 
     * MIGRATION FROM NODE.JS:
     * - findUserByEmail(), createUser() functions
     * - → UserRepository (Spring Data JPA)
     * 
     * @Autowired: Spring automatically injects UserRepository instance
     * Dependency Injection: Spring provides the implementation
     */
    @Autowired
    private UserRepository userRepository;
    
    /**
     * OTP Repository
     */
    @Autowired
    private OtpRepository otpRepository;
    
    /**
     * Password Encoder
     * 
     * MIGRATION FROM NODE.JS:
     * - bcryptjs hashPassword(), comparePassword()
     * - → PasswordEncoder (Spring Security BCrypt)
     */
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * JWT Utility
     */
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * OTP Utility
     */
    @Autowired
    private OtpUtil otpUtil;
    
    /**
     * Signup Service Method
     * 
     * MIGRATION FROM NODE.JS:
     * - signup() controller function → signup() service method
     * 
     * @Transactional: Ensures all database operations succeed or fail together
     * If any operation fails, all changes are rolled back
     * 
     * @param request Signup request DTO
     * @return Signup response with user and token
     * @throws RuntimeException if email already exists or validation fails
     */
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Password and Confirm Password do not match");
        }
        
        // Check if email already exists
        // MIGRATION FROM NODE.JS:
        // - const existingUser = await findUserByEmail(Email)
        // - → userRepository.existsByEmail(email)
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new RuntimeException("Email already registered. Please use another email or login.");
        }
        
        // Create new user
        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        
        // Hash password
        // MIGRATION FROM NODE.JS:
        // - const hashedPassword = await hashPassword(Password)
        // - → passwordEncoder.encode(password)
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Save user to database
        // MIGRATION FROM NODE.JS:
        // - const user = await createUser({...})
        // - → userRepository.save(user)
        user = userRepository.save(user);
        
        // Generate JWT token
        // MIGRATION FROM NODE.JS:
        // - const token = generateToken(user.id)
        // - → jwtUtil.generateToken(user.getId())
        String token = jwtUtil.generateToken(user.getId());
        
        // Create user response (exclude password)
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
        
        return new SignupResponse(userResponse, token);
    }
    
    /**
     * Login Service Method (Step 1: Generate OTP)
     * 
     * MIGRATION FROM NODE.JS:
     * - login() controller function → login() service method
     * 
     * @param request Login request DTO
     * @return Login response with OTP
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Find user by email
        // MIGRATION FROM NODE.JS:
        // - const user = await findUserByEmail(Email, true)
        // - → userRepository.findByEmail(email)
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().toLowerCase());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials. Email or password is incorrect.");
        }
        
        User user = userOpt.get();
        
        // Verify password
        // MIGRATION FROM NODE.JS:
        // - const isValid = await comparePassword(Password, user.Password)
        // - → passwordEncoder.matches(password, user.getPassword())
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials. Email or password is incorrect.");
        }
        
        // Generate OTP
        // MIGRATION FROM NODE.JS:
        // - const otpCode = generateOTP()
        // - → otpUtil.generateOtp()
        String otpCode = otpUtil.generateOtp();
        LocalDateTime expiresAt = otpUtil.getOtpExpiration(10); // 10 minutes
        
        // Invalidate old OTPs
        // MIGRATION FROM NODE.JS:
        // - await invalidateUnusedOTPs(Email)
        // - → otpRepository.invalidateUnusedOtps(email)
        otpRepository.invalidateUnusedOtps(request.getEmail().toLowerCase());
        
        // Save new OTP
        // MIGRATION FROM NODE.JS:
        // - await createOTP({ Email, OTP, expiresAt })
        // - → otpRepository.save(otp)
        Otp otp = new Otp();
        otp.setEmail(request.getEmail().toLowerCase());
        otp.setOtp(otpCode);
        otp.setExpiresAt(expiresAt);
        otp.setUsed(false);
        otpRepository.save(otp);
        
        // Return OTP (for testing - in production, send via email)
        return new LoginResponse(otpCode, "10 minutes");
    }
    
    /**
     * Verify OTP Service Method (Step 2: Complete Login)
     * 
     * MIGRATION FROM NODE.JS:
     * - verifyOTP() controller function → verifyOtp() service method
     * 
     * @param request Verify OTP request DTO
     * @return Signup response with user and token
     */
    @Transactional
    public SignupResponse verifyOtp(VerifyOtpRequest request) {
        // Re-verify password
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().toLowerCase());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials.");
        }
        
        User user = userOpt.get();
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials.");
        }
        
        // Find valid OTP
        // MIGRATION FROM NODE.JS:
        // - const otpRecord = await findValidOTP(Email, otpCode)
        // - → otpRepository.findValidOtp(email, otp, now)
        Optional<Otp> otpOpt = otpRepository.findValidOtp(
                request.getEmail().toLowerCase(),
                request.getOtp(),
                LocalDateTime.now()
        );
        
        if (otpOpt.isEmpty()) {
            throw new RuntimeException("Invalid or expired OTP. Please request a new OTP.");
        }
        
        Otp otp = otpOpt.get();
        
        // Mark OTP as used
        // MIGRATION FROM NODE.JS:
        // - await markOTPAsUsed(otpRecord.id)
        // - → otp.setUsed(true); otpRepository.save(otp)
        otp.setUsed(true);
        otpRepository.save(otp);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId());
        
        // Create user response
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
        
        return new SignupResponse(userResponse, token);
    }
    
    /**
     * Get Current User
     * 
     * MIGRATION FROM NODE.JS:
     * - getCurrentUser() controller → getCurrentUser() service method
     * 
     * @param userId User ID from JWT token
     * @return User response
     */
    public UserResponse getCurrentUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
