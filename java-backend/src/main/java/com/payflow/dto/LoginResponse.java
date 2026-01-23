package com.payflow.dto;

// ============================================================================
// LOGIN RESPONSE DTO - Response after login (OTP generation)
// ============================================================================
// 
// MIGRATION FROM NODE.JS:
// - res.json({ success: true, data: { otp, expiresIn } })
// - → LoginResponse class

/**
 * Login Response DTO
 * 
 * Contains OTP information after successful login
 * (For testing - in production, OTP should be sent via email)
 */
public class LoginResponse {
    
    private String otp;
    private String expiresIn;
    
    // Constructors
    public LoginResponse() {
    }
    
    public LoginResponse(String otp, String expiresIn) {
        this.otp = otp;
        this.expiresIn = expiresIn;
    }
    
    // Getters and Setters
    public String getOtp() {
        return otp;
    }
    
    public void setOtp(String otp) {
        this.otp = otp;
    }
    
    public String getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(String expiresIn) {
        this.expiresIn = expiresIn;
    }
}
