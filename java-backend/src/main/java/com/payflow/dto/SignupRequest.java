package com.payflow.dto;

// ============================================================================
// SIGNUP REQUEST DTO - Data Transfer Object for Signup
// ============================================================================
// 
// WHAT IS A DTO?
// - Data Transfer Object: Object used to transfer data between layers
// - Separates API request/response from internal entities
// - Provides validation and data transformation
// 
// MIGRATION FROM NODE.JS:
// - req.body destructuring → DTO class
// - Manual validation → Bean Validation annotations
// 
// WHY USE DTOs?
// - Security: Don't expose entity structure to API
// - Validation: Validate input before processing
// - Flexibility: Can have different DTOs for different operations
// - Clean separation: API layer separate from database layer

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Signup Request DTO
 * 
 * MIGRATION FROM NODE.JS:
 * - const { FullName, Email, Password, ConfirmPassword } = req.body
 * - → SignupRequest class with validation
 * 
 * This class represents the data sent in POST /api/auth/signup request
 */
public class SignupRequest {
    
    /**
     * Full Name
     * 
     * MIGRATION FROM NODE.JS:
     * - Manual validation: if (!FullName || FullName.length < 2)
     * - → @NotBlank and @Size annotations
     */
    @NotBlank(message = "Full Name is required")
    @Size(min = 2, max = 100, message = "Full Name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "Full Name can only contain letters, spaces, hyphens, and apostrophes")
    private String fullName;
    
    /**
     * Email Address
     * 
     * MIGRATION FROM NODE.JS:
     * - Manual validation: if (!validator.isEmail(Email))
     * - → @Email annotation (automatic validation)
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email")
    @Size(max = 254, message = "Email is too long")
    private String email;
    
    /**
     * Password
     * 
     * MIGRATION FROM NODE.JS:
     * - Manual validation: PASSWORD_REGEX.test(Password)
     * - → @Pattern annotation with regex
     * 
     * Password Requirements:
     * - At least 8 characters, max 64
     * - Must contain: uppercase, lowercase, digit, special character
     */
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,64}$",
        message = "Password must include uppercase, lowercase, number and special character"
    )
    private String password;
    
    /**
     * Confirm Password
     * 
     * MIGRATION FROM NODE.JS:
     * - Manual validation: if (Password !== ConfirmPassword)
     * - → Custom validation in controller/service
     */
    @NotBlank(message = "Confirm Password is required")
    private String confirmPassword;
    
    // ========================================================================
    // CONSTRUCTORS
    // ========================================================================
    
    public SignupRequest() {
    }
    
    public SignupRequest(String fullName, String email, String password, String confirmPassword) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }
    
    // ========================================================================
    // GETTERS AND SETTERS
    // ========================================================================
    
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
    
    public String getConfirmPassword() {
        return confirmPassword;
    }
    
    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
