package com.payflow.util;

// ============================================================================
// JWT UTILITY - JWT Token Generation and Verification
// ============================================================================
// 
// MIGRATION FROM NODE.JS:
// - middleware/auth.js generateToken() → JwtUtil class
// - jsonwebtoken library → jjwt library

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT Utility Class
 * 
 * MIGRATION FROM NODE.JS:
 * - generateToken(userId) → generateToken(Long userId)
 * - jwt.verify(token, secret) → validateToken(String token)
 * 
 * WHAT IS @Component?
 * - Spring annotation that marks class as a Spring bean
 * - Spring creates instance automatically (dependency injection)
 * - Can be injected into other classes with @Autowired
 */
@Component
public class JwtUtil {
    
    /**
     * JWT Secret Key
     * 
     * MIGRATION FROM NODE.JS:
     * - env.JWT_SECRET → @Value("${jwt.secret}")
     * - Injected from application.properties
     * 
     * @Value: Injects value from application.properties
     * ${jwt.secret} reads jwt.secret property
     */
    @Value("${jwt.secret}")
    private String secret;
    
    /**
     * JWT Expiration Time (milliseconds)
     * 
     * MIGRATION FROM NODE.JS:
     * - env.JWT_EXPIRE → @Value("${jwt.expiration}")
     */
    @Value("${jwt.expiration}")
    private Long expiration;
    
    /**
     * Get Secret Key
     * 
     * WHY CONVERT STRING TO SECRETKEY?
     * - jjwt library requires SecretKey object (not String)
     * - Keys.hmacShaKeyFor() converts string to HMAC-SHA key
     * - More secure than using string directly
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    /**
     * Generate JWT Token
     * 
     * MIGRATION FROM NODE.JS:
     * - jwt.sign({ userId }, secret, { expiresIn })
     * - → Jwts.builder()...signWith()...compact()
     * 
     * HOW IT WORKS:
     * 1. Create JWT builder
     * 2. Set subject (userId as string)
     * 3. Set issued at time
     * 4. Set expiration time
     * 5. Sign with secret key
     * 6. Compact to string
     * 
     * @param userId User ID to include in token
     * @return JWT token string
     */
    public String generateToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .setSubject(userId.toString()) // User ID as string in token
                .setIssuedAt(now) // When token was created
                .setExpiration(expiryDate) // When token expires
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Sign with secret
                .compact(); // Convert to string
    }
    
    /**
     * Get User ID from Token
     * 
     * MIGRATION FROM NODE.JS:
     * - jwt.verify(token, secret).userId
     * - → extract claims and get subject
     * 
     * @param token JWT token string
     * @return User ID (Long)
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return Long.parseLong(claims.getSubject());
    }
    
    /**
     * Validate JWT Token
     * 
     * MIGRATION FROM NODE.JS:
     * - jwt.verify(token, secret) with try-catch
     * - → validateToken() method
     * 
     * @param token JWT token string
     * @return true if valid, false if invalid/expired
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
