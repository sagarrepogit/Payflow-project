package com.payflow.exception;

// ============================================================================
// GLOBAL EXCEPTION HANDLER - Centralized Error Handling
// ============================================================================
// 
// WHAT IS THIS?
// - Catches all exceptions and converts them to proper HTTP responses
// - Similar to try-catch in Node.js controllers, but centralized
// 
// MIGRATION FROM NODE.JS:
// - try-catch in each controller → @ControllerAdvice with @ExceptionHandler

import com.payflow.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler
 * 
 * MIGRATION FROM NODE.JS:
 * - try-catch in controllers → @ExceptionHandler methods
 * - Manual error responses → Automatic error response generation
 * 
 * @ControllerAdvice: Applies to all controllers
 * Catches exceptions from any controller method
 */
@ControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * Handle Validation Errors
     * 
     * MIGRATION FROM NODE.JS:
     * - Manual validation error handling
     * - → MethodArgumentNotValidException handler
     * 
     * @param ex Validation exception
     * @return Error response with validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        // Extract all validation errors
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation error"));
    }
    
    /**
     * Handle Runtime Exceptions (Business Logic Errors)
     * 
     * MIGRATION FROM NODE.JS:
     * - throw new Error("message") → RuntimeException
     * - catch (error) → @ExceptionHandler(RuntimeException.class)
     * 
     * @param ex RuntimeException
     * @return Error response
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex) {
        // Check if it's an authentication error
        if (ex.getMessage().contains("Invalid credentials") || 
            ex.getMessage().contains("Invalid or expired OTP") ||
            ex.getMessage().contains("Access denied")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(ex.getMessage()));
        }
        
        // Check if it's a conflict (duplicate email)
        if (ex.getMessage().contains("already registered") || 
            ex.getMessage().contains("already exists")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(ex.getMessage()));
        }
        
        // Default to bad request
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }
    
    /**
     * Handle All Other Exceptions
     * 
     * MIGRATION FROM NODE.JS:
     * - catch (error) → @ExceptionHandler(Exception.class)
     * 
     * @param ex Exception
     * @return Error response
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred"));
    }
}
