package com.payflow.dto;

// ============================================================================
// VERIFY OTP REQUEST DTO - Data Transfer Object for OTP Verification
// ============================================================================

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Verify OTP Request DTO
 * 
 * MIGRATION FROM NODE.JS:
 * - const { Email, Password, OTP } = req.body
 * - → VerifyOtpRequest class
 */
public class VerifyOtpRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "OTP is required")
    private String otp;
    
    // Constructors
    public VerifyOtpRequest() {
    }
    
    public VerifyOtpRequest(String email, String password, String otp) {
        this.email = email;
        this.password = password;
        this.otp = otp;
    }
    
    // Getters and Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getOtp() {
        return otp;
    }
    
    public void setOtp(String otp) {
        this.otp = otp;
    }
}
