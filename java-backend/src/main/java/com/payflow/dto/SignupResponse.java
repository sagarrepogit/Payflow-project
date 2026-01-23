package com.payflow.dto;

// ============================================================================
// SIGNUP RESPONSE DTO - Response after successful signup
// ============================================================================
// 
// MIGRATION FROM NODE.JS:
// - res.json({ success: true, data: { user, token } })
// - → SignupResponse class

/**
 * Signup Response DTO
 * 
 * Contains user data and JWT token after successful signup
 */
public class SignupResponse {
    
    private UserResponse user;
    private String token;
    
    // Constructors
    public SignupResponse() {
    }
    
    public SignupResponse(UserResponse user, String token) {
        this.user = user;
        this.token = token;
    }
    
    // Getters and Setters
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
}
