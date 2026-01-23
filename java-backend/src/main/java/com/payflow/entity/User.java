package com.payflow.entity;

// ============================================================================
// USER ENTITY - Represents users table in database
// ============================================================================
// 
// WHAT IS AN ENTITY?
// - Java class that represents a database table
// - Each instance = one row in the table
// - JPA/Hibernate automatically maps this class to database table
// 
// MIGRATION FROM NODE.JS:
// - models/user.js SQL functions → User entity class
// - Manual SQL queries → JPA automatically generates SQL
// 
// WHY USE ENTITIES?
// - Type-safe: Compiler checks for errors
// - Automatic SQL generation: No need to write SQL manually
// - Object-oriented: Work with Java objects, not raw data
// - Relationships: Easy to define relationships between tables

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * User Entity
 * 
 * MIGRATION FROM NODE.JS:
 * - SQL CREATE TABLE users → @Entity class
 * - Table columns → Class fields with @Column
 * - Primary key → @Id with @GeneratedValue
 * - Constraints → @NotNull, @Email, etc.
 */
@Entity
@Table(name = "users")
// @Table(name = "users") tells JPA this class maps to "users" table
// If table name matches class name (User → user), @Table is optional
public class User {
    
    /**
     * User ID (Primary Key)
     * 
     * MIGRATION FROM NODE.JS:
     * - id INT AUTO_INCREMENT → @Id @GeneratedValue
     * - MySQL auto-increment → GenerationType.IDENTITY
     * 
     * @Id: Marks this field as primary key
     * @GeneratedValue: Auto-generates ID (like AUTO_INCREMENT in MySQL)
     * strategy = IDENTITY: Uses database auto-increment (MySQL AUTO_INCREMENT)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Full Name
     * 
     * MIGRATION FROM NODE.JS:
     * - FullName VARCHAR(100) NOT NULL → @Column with @NotBlank
     * - Application validation → @Size annotation
     * 
     * @Column: Maps to database column
     * - name = "FullName": Column name in database (case-sensitive if needed)
     * - nullable = false: NOT NULL constraint
     * 
     * @NotBlank: Validation - field cannot be empty or whitespace
     * @Size: Validation - min/max length
     */
    @Column(name = "FullName", nullable = false, length = 100)
    @NotBlank(message = "Full Name is required")
    @Size(min = 2, max = 100, message = "Full Name must be between 2 and 100 characters")
    private String fullName;
    
    /**
     * Email Address
     * 
     * MIGRATION FROM NODE.JS:
     * - Email VARCHAR(254) UNIQUE → @Column(unique=true) with @Email
     * - Unique constraint → unique = true in @Column
     * 
     * @Email: Validates email format automatically
     * unique = true: Creates UNIQUE constraint in database
     */
    @Column(name = "Email", nullable = false, unique = true, length = 254)
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email")
    @Size(max = 254, message = "Email is too long")
    private String email;
    
    /**
     * Password (Hashed)
     * 
     * MIGRATION FROM NODE.JS:
     * - Password VARCHAR(255) NOT NULL → @Column with @NotBlank
     * - Bcrypt hash stored here (not plain text)
     * 
     * NOTE: Password validation is done in DTO (SignupRequest), not here
     * Entity stores the hashed password from service layer
     */
    @Column(name = "Password", nullable = false, length = 255)
    @NotBlank
    private String password;
    
    /**
     * Password Changed At
     * 
     * MIGRATION FROM NODE.JS:
     * - passwordChangedAt TIMESTAMP NULL → LocalDateTime (nullable)
     * - Tracks when password was last changed
     */
    @Column(name = "passwordChangedAt")
    private LocalDateTime passwordChangedAt;
    
    /**
     * Created At
     * 
     * MIGRATION FROM NODE.JS:
     * - createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP → @CreationTimestamp
     * - Automatically set when entity is created
     */
    @Column(name = "createdAt", nullable = false, updatable = false)
    @org.hibernate.annotations.CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * Updated At
     * 
     * MIGRATION FROM NODE.JS:
     * - updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP → @UpdateTimestamp
     * - Automatically updated when entity is modified
     */
    @Column(name = "updatedAt", nullable = false)
    @org.hibernate.annotations.UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // ========================================================================
    // CONSTRUCTORS
    // ========================================================================
    // 
    // WHY MULTIPLE CONSTRUCTORS?
    // - Default constructor: Required by JPA
    // - Parameterized constructor: Convenience for creating objects
    
    /**
     * Default Constructor
     * 
     * WHY REQUIRED?
     * - JPA/Hibernate needs default constructor to create entity instances
     * - Used when loading entities from database
     */
    public User() {
    }
    
    /**
     * Parameterized Constructor
     * 
     * Convenience constructor for creating User objects
     */
    public User(String fullName, String email, String password) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
    }
    
    // ========================================================================
    // GETTERS AND SETTERS
    // ========================================================================
    // 
    // WHY GETTERS/SETTERS?
    // - Java Bean convention (required for JPA)
    // - Allows accessing/modifying private fields
    // - JPA uses getters/setters to read/write data
    
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
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public LocalDateTime getPasswordChangedAt() {
        return passwordChangedAt;
    }
    
    public void setPasswordChangedAt(LocalDateTime passwordChangedAt) {
        this.passwordChangedAt = passwordChangedAt;
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
