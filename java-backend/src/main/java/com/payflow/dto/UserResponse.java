package com.payflow.dto;

// ============================================================================
// USER RESPONSE DTO - User data sent to client
// ============================================================================
// 
// MIGRATION FROM NODE.JS:
// - res.json({ user: { id, FullName, Email, ... } })
// - → UserResponse class (excludes password)

import java.time.LocalDateTime;

/**
 * User Response DTO
 * 
 * MIGRATION FROM NODE.JS:
 * - User object with selected fields (excludes password)
 * - Used in API responses
 */
public class UserResponse {
    
    private Long id;
    private String fullName;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public UserResponse() {
    }
    
    public UserResponse(Long id, String fullName, String email, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
