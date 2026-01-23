package com.payflow;

// ============================================================================
// MAIN APPLICATION CLASS - Spring Boot Entry Point
// ============================================================================
// 
// WHAT IS THIS CLASS?
// - Main entry point for Spring Boot application
// - Similar to server.js in Node.js
// - Spring Boot starts embedded Tomcat server here
// 
// MIGRATION FROM NODE.JS:
// - server.js → PayflowApplication.java
// - app.listen(port) → Spring Boot auto-starts server

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * PayFlow Application Main Class
 * 
 * MIGRATION FROM NODE.JS:
 * - const app = express(); app.listen(port)
 * - → @SpringBootApplication annotation (does everything automatically)
 * 
 * @SpringBootApplication: Combines three annotations:
 * - @Configuration: Marks class as configuration source
 * - @EnableAutoConfiguration: Enables Spring Boot auto-configuration
 * - @ComponentScan: Scans for Spring components (controllers, services, etc.)
 * 
 * HOW IT WORKS:
 * 1. Spring Boot scans this package and sub-packages
 * 2. Finds all @Component, @Service, @Repository, @Controller classes
 * 3. Creates instances (beans) and wires them together (dependency injection)
 * 4. Starts embedded Tomcat server
 * 5. Application is ready to handle requests
 */
@SpringBootApplication
public class PayflowApplication {
    
    /**
     * Main Method
     * 
     * MIGRATION FROM NODE.JS:
     * - node server.js
     * - → java -jar app.jar or mvn spring-boot:run
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        // SpringApplication.run() starts the Spring Boot application
        // Similar to app.listen() in Node.js, but does much more:
        // - Loads application.properties
        // - Creates Spring context
        // - Starts embedded server
        // - Registers all components
        SpringApplication.run(PayflowApplication.class, args);
        
        // After this line, your application is running!
        // Server starts on port specified in application.properties (default: 8080)
        // Or port 4000 if you set server.port=4000
    }
}
