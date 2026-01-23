# PayFlow Backend - Java/Spring Boot Migration

## 🎯 Overview

This is a complete migration of the PayFlow payment gateway backend from **Node.js/Express** to **Java/Spring Boot**. All functionality has been preserved and enhanced with Spring Boot's powerful features.

---

## 📋 What Was Migrated

### Complete Feature Migration:
- ✅ User Authentication (Signup, Login, OTP Verification)
- ✅ JWT Token Generation and Validation
- ✅ Password Hashing (BCrypt)
- ✅ OTP Generation and Validation
- ✅ Database Operations (MySQL)
- ✅ REST API Endpoints
- ✅ CORS Configuration
- ✅ Input Validation
- ✅ Error Handling

---

## 🏗️ Project Structure

```
java-backend/
├── src/
│   ├── main/
│   │   ├── java/com/payflow/
│   │   │   ├── PayflowApplication.java      # Main application class
│   │   │   ├── controller/                  # REST API endpoints
│   │   │   │   └── AuthController.java
│   │   │   ├── service/                     # Business logic
│   │   │   │   └── AuthService.java
│   │   │   ├── repository/                 # Database access
│   │   │   │   ├── UserRepository.java
│   │   │   │   └── OtpRepository.java
│   │   │   ├── entity/                      # Database entities
│   │   │   │   ├── User.java
│   │   │   │   └── Otp.java
│   │   │   ├── dto/                         # Data Transfer Objects
│   │   │   │   ├── SignupRequest.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── VerifyOtpRequest.java
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── UserResponse.java
│   │   │   │   ├── SignupResponse.java
│   │   │   │   └── LoginResponse.java
│   │   │   ├── util/                        # Utility classes
│   │   │   │   ├── JwtUtil.java
│   │   │   │   └── OtpUtil.java
│   │   │   ├── config/                      # Configuration
│   │   │   │   └── SecurityConfig.java
│   │   │   └── exception/                   # Exception handling
│   │   │       └── GlobalExceptionHandler.java
│   │   └── resources/
│   │       └── application.properties       # Configuration file
│   └── test/                                # Test files (optional)
└── pom.xml                                  # Maven dependencies
```

---

## 🔄 Node.js to Java Migration Mapping

### Technology Stack:

| Node.js | Java/Spring Boot |
|---------|------------------|
| Express.js | Spring Boot Web (Spring MVC) |
| mysql2 | Spring Data JPA + MySQL Connector |
| jsonwebtoken | jjwt (Java JWT) |
| bcryptjs | Spring Security BCryptPasswordEncoder |
| dotenv | application.properties |
| Manual SQL | JPA/Hibernate (ORM) |
| Try-catch in controllers | @ExceptionHandler (Global) |
| Manual validation | Bean Validation (@Valid) |

### Code Structure:

| Node.js | Java |
|---------|------|
| `models/user.js` (SQL functions) | `entity/User.java` + `repository/UserRepository.java` |
| `controllers/authController.js` | `controller/AuthController.java` + `service/AuthService.java` |
| `middleware/auth.js` | `util/JwtUtil.java` + `config/SecurityConfig.java` |
| `utils/password.js` | `config/SecurityConfig.java` (PasswordEncoder bean) |
| `utils/otp.js` | `util/OtpUtil.java` |
| `routes/authRoutes.js` | `@RequestMapping` in `AuthController.java` |
| `server.js` | `PayflowApplication.java` |

---

## 🚀 Setup Instructions

### Prerequisites:
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- IDE (IntelliJ IDEA, Eclipse, or VS Code)

### Step 1: Install Java and Maven

**macOS:**
```bash
brew install openjdk@17
brew install maven
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install openjdk-17-jdk maven
```

**Windows:**
- Download Java 17 from: https://adoptium.net/
- Download Maven from: https://maven.apache.org/download.cgi

### Step 2: Setup MySQL Database

```bash
# Create database
mysql -u root -p
CREATE DATABASE payflow_db;
exit;
```

### Step 3: Run Database Schema

```bash
# Use the same schema.sql from Node.js project
mysql -u root -p payflow_db < ../backend/src/Database/schema.sql
```

### Step 4: Configure Application

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/payflow_db
spring.datasource.username=root
spring.datasource.password=your_password

# JWT
jwt.secret=your-secret-key-change-in-production-min-256-bits
jwt.expiration=604800000

# Server
server.port=4000
```

Or use environment variables:
```bash
export DB_USER=root
export DB_PASSWORD=your_password
export JWT_SECRET=your-secret-key
```

### Step 5: Build and Run

```bash
# Navigate to project directory
cd java-backend

# Build project
mvn clean install

# Run application
mvn spring-boot:run
```

Or run the JAR file:
```bash
java -jar target/payflow-backend-1.0.0.jar
```

---

## 📡 API Endpoints

All endpoints are the same as Node.js version:

### Public Endpoints:

**POST /api/auth/signup**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123@",
  "confirmPassword": "SecurePass123@"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123@"
}
```

**POST /api/auth/verify-otp**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123@",
  "otp": "123456"
}
```

### Protected Endpoints:

**GET /api/auth/me**
```
Headers: Authorization: Bearer <token>
```

---

## 🔑 Key Concepts Explained

### 1. **Dependency Injection**
- **Node.js**: Manual imports (`require()`)
- **Java**: `@Autowired` - Spring automatically provides dependencies

### 2. **Database Access**
- **Node.js**: Manual SQL queries with `mysql2`
- **Java**: JPA/Hibernate - Write Java code, Spring generates SQL

### 3. **Validation**
- **Node.js**: Manual validation in controllers
- **Java**: Bean Validation annotations (`@Valid`, `@Email`, `@Size`)

### 4. **Error Handling**
- **Node.js**: Try-catch in each controller
- **Java**: `@ControllerAdvice` - Centralized exception handling

### 5. **Configuration**
- **Node.js**: `.env` file with `dotenv`
- **Java**: `application.properties` with `@Value` injection

---

## 📚 Learning Resources

### For Beginners:

1. **Spring Boot Basics:**
   - Official Docs: https://spring.io/guides
   - Spring Boot Tutorial: https://www.baeldung.com/spring-boot

2. **JPA/Hibernate:**
   - JPA Tutorial: https://www.baeldung.com/learn-jpa-hibernate

3. **Spring Security:**
   - Security Guide: https://spring.io/guides/topicals/spring-security-architecture

4. **Maven:**
   - Maven Guide: https://maven.apache.org/guides/getting-started/

---

## 🎓 What You Learned

By migrating this project, you've learned:

1. ✅ **Spring Boot Framework** - Web application framework
2. ✅ **Spring Data JPA** - Database access without SQL
3. ✅ **Spring Security** - Authentication and authorization
4. ✅ **Bean Validation** - Input validation
5. ✅ **Dependency Injection** - Spring's core feature
6. ✅ **REST API Development** - Building RESTful services
7. ✅ **Maven** - Build tool and dependency management
8. ✅ **Java Best Practices** - Layered architecture, DTOs, etc.

---

## 🔍 Code Comparison Examples

### Signup Function:

**Node.js:**
```javascript
const signup = async (req, res) => {
    const { FullName, Email, Password } = req.body;
    const existingUser = await findUserByEmail(Email);
    if (existingUser) {
        return res.status(409).json({...});
    }
    const hashedPassword = await hashPassword(Password);
    const user = await createUser({...});
    const token = generateToken(user.id);
    res.status(201).json({...});
};
```

**Java:**
```java
@PostMapping("/signup")
public ResponseEntity<ApiResponse<SignupResponse>> signup(
        @Valid @RequestBody SignupRequest request) {
    SignupResponse response = authService.signup(request);
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("User registered", response));
}
```

---

## 🐛 Troubleshooting

### Error: "Could not connect to database"
- Check MySQL is running: `mysql -u root -p`
- Verify database exists: `SHOW DATABASES;`
- Check `application.properties` credentials

### Error: "Port 4000 already in use"
- Change port in `application.properties`: `server.port=4001`
- Or kill process: `lsof -ti:4000 | xargs kill -9`

### Error: "JWT secret too short"
- Use at least 256-bit secret (32+ characters)
- Update `jwt.secret` in `application.properties`

---

## 📝 Next Steps

1. **Add Tests**: Write JUnit tests for services and controllers
2. **Add Logging**: Configure SLF4J/Logback for better logging
3. **Add Swagger**: API documentation with Swagger/OpenAPI
4. **Add JWT Filter**: Proper Spring Security JWT filter (instead of manual extraction)
5. **Add Email Service**: Send OTP via email (currently returns in response)

---

## 🎉 Congratulations!

You've successfully migrated a Node.js backend to Java/Spring Boot! This demonstrates:
- Understanding of both Node.js and Java ecosystems
- Ability to work with different frameworks
- Knowledge of REST API development
- Database integration skills

---

## 📞 Support

If you encounter issues:
1. Check Spring Boot logs (console output)
2. Verify database connection
3. Check `application.properties` configuration
4. Review error messages carefully

---

**Happy Coding! 🚀**
