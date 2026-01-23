package com.payflow.util;

// ============================================================================
// OTP UTILITY - OTP Generation and Validation
// ============================================================================
// 
// MIGRATION FROM NODE.JS:
// - utils/otp.js → OtpUtil class

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

/**
 * OTP Utility Class
 * 
 * MIGRATION FROM NODE.JS:
 * - generateOTP() → generateOtp()
 * - getOTPExpiration(minutes) → getOtpExpiration(int minutes)
 */
@Component
public class OtpUtil {
    
    /**
     * Generate 6-digit OTP
     * 
     * MIGRATION FROM NODE.JS:
     * - Math.floor(100000 + Math.random() * 900000)
     * - → Random.nextInt(900000) + 100000
     * 
     * HOW IT WORKS:
     * - Random.nextInt(900000) generates 0-899999
     * - Add 100000 to get 100000-999999 (always 6 digits)
     * - Convert to string and pad if needed
     * 
     * @return 6-digit OTP as string
     */
    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 100000 to 999999
        return String.format("%06d", otp); // Ensure 6 digits with leading zeros
    }
    
    /**
     * Calculate OTP Expiration Time
     * 
     * MIGRATION FROM NODE.JS:
     * - new Date(now.getTime() + minutes * 60 * 1000)
     * - → LocalDateTime.now().plusMinutes(minutes)
     * 
     * @param minutes Minutes until expiration
     * @return Expiration LocalDateTime
     */
    public LocalDateTime getOtpExpiration(int minutes) {
        return LocalDateTime.now().plusMinutes(minutes);
    }
    
    /**
     * Validate OTP Format
     * 
     * MIGRATION FROM NODE.JS:
     * - /^\d{6}$/.test(otp)
     * - → otp.matches("\\d{6}")
     * 
     * @param otp OTP string to validate
     * @return true if valid format (6 digits)
     */
    public boolean isValidOtpFormat(String otp) {
        return otp != null && otp.matches("\\d{6}");
    }
}
