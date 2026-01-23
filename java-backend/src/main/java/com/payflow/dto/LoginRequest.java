package com.payflow.dto;

// ============================================================================
// LOGIN REQUEST DTO - Data Transfer Object for Login
// ============================================================================

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Login Request DTO
 * 
 * MIGRATION FROM NODE.JS:
 * - const { Email, Password } = req.body
 * - → LoginRequest class
 */
public class LoginRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    // Constructors
    public LoginRequest() {
    }
    
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
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
}
