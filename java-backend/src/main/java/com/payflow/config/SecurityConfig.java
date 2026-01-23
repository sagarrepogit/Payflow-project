package com.payflow.config;

// ============================================================================
// SECURITY CONFIGURATION - Spring Security Setup
// ============================================================================
// 
// WHAT IS THIS?
// - Configures Spring Security (authentication, authorization, CORS)
// - Similar to CORS middleware and JWT authentication in Node.js
// 
// MIGRATION FROM NODE.JS:
// - cors middleware → CORS configuration
// - JWT authentication middleware → Spring Security filter chain

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Security Configuration
 * 
 * MIGRATION FROM NODE.JS:
 * - cors middleware → CORS configuration
 * - Password hashing → BCryptPasswordEncoder bean
 * 
 * @Configuration: Marks class as configuration (creates beans)
 * @EnableWebSecurity: Enables Spring Security
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    /**
     * Password Encoder Bean
     * 
     * MIGRATION FROM NODE.JS:
     * - bcryptjs with 12 rounds
     * - → BCryptPasswordEncoder (Spring Security)
     * 
     * @Bean: Creates a Spring bean (can be injected with @Autowired)
     * 
     * WHY BCryptPasswordEncoder?
     * - Uses BCrypt algorithm (same as bcryptjs in Node.js)
     * - Default strength is 10 rounds (can be increased)
     * - Automatically generates salt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
        // BCryptPasswordEncoder uses 10 rounds by default
        // For 12 rounds (like Node.js), use: new BCryptPasswordEncoder(12)
    }
    
    /**
     * Security Filter Chain
     * 
     * MIGRATION FROM NODE.JS:
     * - app.use(cors({...}))
     * - JWT authentication middleware
     * - → SecurityFilterChain configuration
     * 
     * @param http HttpSecurity builder
     * @return SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (Cross-Site Request Forgery) for API
            // APIs are stateless (use JWT, not sessions)
            .csrf(csrf -> csrf.disable())
            
            // CORS Configuration
            // MIGRATION FROM NODE.JS:
            // - app.use(cors({ origin: 'http://localhost:3000' }))
            // - → cors() configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Session Management
            // MIGRATION FROM NODE.JS:
            // - Stateless (JWT tokens, no sessions)
            // - → SessionCreationPolicy.STATELESS
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Authorization Rules
            // MIGRATION FROM NODE.JS:
            // - Public routes: /api/auth/signup, /api/auth/login
            // - Protected routes: /api/auth/me
            // - → requestMatchers() configuration
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication required)
                .requestMatchers("/api/auth/signup", "/api/auth/login", "/api/auth/verify-otp").permitAll()
                // All other endpoints require authentication
                .anyRequest().authenticated()
            );
        
        // NOTE: JWT authentication filter would be added here
        // For now, we're using manual token extraction in controller
        // In production, add JwtAuthenticationFilter to filter chain
        
        return http.build();
    }
    
    /**
     * CORS Configuration Source
     * 
     * MIGRATION FROM NODE.JS:
     * - cors({ origin: 'http://localhost:3000', credentials: true, ... })
     * - → CorsConfiguration object
     * 
     * @return CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allowed origins (frontend URLs)
        // MIGRATION FROM NODE.JS:
        // - origin: 'http://localhost:3000'
        // - → setAllowedOrigins()
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
        
        // Allowed HTTP methods
        // MIGRATION FROM NODE.JS:
        // - methods: ['GET', 'POST', 'PUT', 'DELETE']
        // - → setAllowedMethods()
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Allowed headers
        // MIGRATION FROM NODE.JS:
        // - allowedHeaders: ['Content-Type', 'Authorization']
        // - → setAllowedHeaders()
        configuration.setAllowedHeaders(Arrays.asList("Content-Type", "Authorization"));
        
        // Allow credentials (cookies, authentication headers)
        // MIGRATION FROM NODE.JS:
        // - credentials: true
        // - → setAllowCredentials()
        configuration.setAllowCredentials(true);
        
        // Apply CORS configuration to all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
