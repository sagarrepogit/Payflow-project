package com.payflow.repository;

// ============================================================================
// OTP REPOSITORY - Database Access Layer for OTPs
// ============================================================================
// 
// MIGRATION FROM NODE.JS:
// - models/otp.js SQL functions → OtpRepository interface

import com.payflow.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * OTP Repository Interface
 * 
 * MIGRATION FROM NODE.JS:
 * - findValidOTP(email, otp) → Custom query method
 * - createOTP(otpData) → save(otp) method
 * - markOTPAsUsed(otpId) → Custom update query
 * - invalidateUnusedOTPs(email) → Custom update query
 */
@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    
    /**
     * Find Valid OTP
     * 
     * MIGRATION FROM NODE.JS:
     * - findValidOTP(email, otpCode) → Custom query
     * 
     * WHY CUSTOM QUERY?
     * - Complex conditions: email + otp + used + expiration
     * - Spring method naming can't express this easily
     * - @Query allows writing custom SQL/JPQL
     * 
     * @Query: Custom query using JPQL (Java Persistence Query Language)
     * - JPQL is similar to SQL but uses entity names instead of table names
     * - "Otp" is entity name, "otps" is table name
     * - :email and :otp are named parameters
     * 
     * @param email User's email
     * @param otp OTP code
     * @param now Current timestamp (for expiration check)
     * @return Optional containing Otp if valid, empty if not
     */
    @Query("SELECT o FROM Otp o WHERE o.email = :email AND o.otp = :otp AND o.used = false AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    Optional<Otp> findValidOtp(@Param("email") String email, @Param("otp") String otp, @Param("now") LocalDateTime now);
    
    /**
     * Invalidate All Unused OTPs for Email
     * 
     * MIGRATION FROM NODE.JS:
     * - invalidateUnusedOTPs(email) → Custom update query
     * 
     * @Modifying: Marks query as modifying (UPDATE/DELETE)
     * Required for UPDATE and DELETE queries
     * 
     * @Query: Custom UPDATE query
     * - Sets used = true for all unused OTPs with matching email
     */
    @Modifying
    @Query("UPDATE Otp o SET o.used = true WHERE o.email = :email AND o.used = false")
    void invalidateUnusedOtps(@Param("email") String email);
    
    /**
     * Cleanup Expired OTPs (Optional - for maintenance)
     * 
     * MIGRATION FROM NODE.JS:
     * - cleanupExpiredOTPs() → Custom delete query
     * 
     * @Modifying: Required for DELETE queries
     */
    @Modifying
    @Query("DELETE FROM Otp o WHERE o.expiresAt < :now")
    int cleanupExpiredOtps(@Param("now") LocalDateTime now);
}
