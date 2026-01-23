package com.payflow.repository;

// ============================================================================
// USER REPOSITORY - Database Access Layer for Users
// ============================================================================
// 
// WHAT IS A REPOSITORY?
// - Interface that provides database operations
// - Spring Data JPA automatically implements this interface
// - No need to write SQL - Spring generates it automatically
// 
// MIGRATION FROM NODE.JS:
// - models/user.js SQL functions → UserRepository interface
// - findUserByEmail() → findByEmail() method
// - createUser() → save() method (inherited from JpaRepository)
// - Manual SQL → Spring Data JPA generates SQL automatically

import com.payflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User Repository Interface
 * 
 * MIGRATION FROM NODE.JS:
 * - findUserByEmail(email) → Optional<User> findByEmail(String email)
 * - findUserById(id) → Optional<User> findById(Long id)
 * - createUser(userData) → save(user) method
 * 
 * WHY INTERFACE?
 * - Spring Data JPA creates implementation automatically
 * - No need to write implementation code
 * - Just define method signatures, Spring does the rest
 * 
 * HOW IT WORKS:
 * - Spring scans this interface at startup
 * - Generates implementation class automatically
 * - Creates SQL queries based on method names
 * - Example: findByEmail() → SELECT * FROM users WHERE email = ?
 */
@Repository
// @Repository: Tells Spring this is a repository (data access layer)
// Spring manages this as a bean (can be injected with @Autowired)
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find User by Email
     * 
     * MIGRATION FROM NODE.JS:
     * - findUserByEmail(email) → findByEmail(email)
     * 
     * HOW SPRING GENERATES SQL:
     * - Method name: findByEmail
     * - Spring understands: find + By + Email
     * - Generates: SELECT * FROM users WHERE email = ?
     * - Parameter: String email (used in WHERE clause)
     * 
     * WHY Optional<User>?
     * - Optional: Java 8+ feature for handling null safely
     * - User might not exist (email not found)
     * - Optional.empty() = not found, Optional.of(user) = found
     * - Prevents NullPointerException
     * 
     * @param email User's email address
     * @return Optional containing User if found, empty if not found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if User exists by Email
     * 
     * MIGRATION FROM NODE.JS:
     * - Manual check: if (findUserByEmail(email) != null)
     * - New: existsByEmail(email) - more efficient
     * 
     * HOW IT WORKS:
     * - Spring generates: SELECT COUNT(*) > 0 FROM users WHERE email = ?
     * - Returns boolean: true if exists, false if not
     * - More efficient than fetching full user object
     * 
     * @param email User's email address
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    // NOTE: Other methods are inherited from JpaRepository:
    // - findById(Long id): Find by ID
    // - save(User user): Save (insert or update)
    // - delete(User user): Delete user
    // - findAll(): Get all users
    // - etc.
}
