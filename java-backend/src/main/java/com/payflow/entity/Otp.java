package com.payflow.entity;

// ============================================================================
// OTP ENTITY - Represents otps table in database
// ============================================================================
// 
// MIGRATION FROM NODE.JS:
// - models/otp.js SQL functions → Otp entity class
// - Manual SQL queries → JPA automatically generates SQL

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

/**
 * OTP (One-Time Password) Entity
 * 
 * MIGRATION FROM NODE.JS:
 * - SQL CREATE TABLE otps → @Entity class
 * - Stores OTPs for two-factor authentication
 */
@Entity
@Table(name = "otps")
public class Otp {
    
    /**
     * OTP ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Email associated with OTP
     */
    @Column(name = "Email", nullable = false, length = 254)
    @NotBlank
    @Email
    private String email;
    
    /**
     * OTP Code (6 digits)
     * 
     * @Pattern: Validates 6-digit format
     * regexp = "\\d{6}": Exactly 6 digits
     */
    @Column(name = "OTP", nullable = false, length = 6)
    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "OTP must be exactly 6 digits")
    private String otp;
    
    /**
     * Expiration Timestamp
     * 
     * MIGRATION FROM NODE.JS:
     * - expiresAt TIMESTAMP → LocalDateTime
     * - Used to check if OTP is still valid
     */
    @Column(name = "expiresAt", nullable = false)
    private LocalDateTime expiresAt;
    
    /**
     * Used Flag
     * 
     * MIGRATION FROM NODE.JS:
     * - used TINYINT(1) → Boolean
     * - Tracks if OTP has been used (one-time use)
     */
    @Column(name = "used", nullable = false)
    private Boolean used = false;
    
    /**
     * Created At
     */
    @Column(name = "createdAt", nullable = false, updatable = false)
    @org.hibernate.annotations.CreationTimestamp
    private LocalDateTime createdAt;
    
    // ========================================================================
    // CONSTRUCTORS
    // ========================================================================
    
    public Otp() {
    }
    
    public Otp(String email, String otp, LocalDateTime expiresAt) {
        this.email = email;
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.used = false;
    }
    
    // ========================================================================
    // GETTERS AND SETTERS
    // ========================================================================
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getOtp() {
        return otp;
    }
    
    public void setOtp(String otp) {
        this.otp = otp;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public Boolean getUsed() {
        return used;
    }
    
    public void setUsed(Boolean used) {
        this.used = used;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
