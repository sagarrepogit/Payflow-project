package com.payflow.dto;

// ============================================================================
// API RESPONSE DTO - Standard Response Format
// ============================================================================
// 
// MIGRATION FROM NODE.JS:
// - res.json({ success: true, message: "...", data: {...} })
// - → ApiResponse<T> generic class
// 
// WHY GENERIC CLASS?
// - <T> allows different data types
// - ApiResponse<User> for user data
// - ApiResponse<String> for simple messages
// - Type-safe responses

/**
 * Generic API Response Wrapper
 * 
 * Provides consistent response format across all endpoints
 * 
 * @param <T> Type of data in response
 */
public class ApiResponse<T> {
    
    private boolean success;
    private String message;
    private T data;
    
    // Constructors
    public ApiResponse() {
    }
    
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    // Static factory methods for convenience
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
}
