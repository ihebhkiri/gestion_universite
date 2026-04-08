# University Management System (Gestion Universitaire) - Backend

Developed with modern **Spring Boot 3** practices, this backend provides a robust and secure foundation for managing a university's academic and administrative operations.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure stateless authentication using JWT stored in HTTP-only cookies.
- **Refresh Token Rotation**: Enhanced security with token rotation (15m JWT, 7d Refresh Token).
- **SSL/HTTPS**: Configured for secure communication (Self-signed certificate with Keytool).
- **Password Management**: Robust reset password flow with timed email tokens.
- **Bug Fixes**: Resolved 403 Forbidden login errors and `LazyInitializationException` in Security contexts.

### 🎓 Academic Management
- **Department & Speciality**: Hierarchical management from Departments down to specific Academic Levels.
- **Student Management**: Full CRUD for students with enrollment status tracking.
- **Teacher Management**: Management of teacher profiles and teaching assignments.
- **Group Allocation**: Seamless assignment of groups to academic levels.

### 📝 Evaluations & Grades
- **Exam Management**: Creation and tracking of exams per session.
- **Grade Tracking**: Recording of student grades with uniqueness constraints on exam/student pairs.

### 🏗️ Architecture & Core
- **Audit Logging**: Centralized auditing via `BaseEntity` (createdAt, updatedAt).
- **Clean Architecture**: Refactored to a coherent Controller → Service → Repository layer system.
- **DTO Pattern**: Standardized API responses using generated DTOs for all major entities.
- **Database Migrations**: Integrated **Flyway** for reliable version-controlled schema management.

---

## 🛠️ Tech Stack

- **Core**: Java 17, Spring Boot 3.2.5
- **Data Persistence**: Spring Data JPA, Hibernate
- **Database**: MySQL (Production), H2 (Testing)
- **Security**: Spring Security, JJWT (io.jsonwebtoken)
- **Migrations**: Flyway
- **Tooling**: Lombok, Maven, Actuator
- **API Documentation**: SpringDoc OpenAPI (Swagger UI)
- **Deployment**: Docker (Dockerfile included)

---

## 📁 Project Structure

Below is an overview of the project's organization and the purpose of each major module:

### 📂 `src/main/java/com/iheb/gestion_universite/`
*   **`core/`**: Contains the foundational building blocks of the application.
    *   `base_entity/`: Defines global auditing fields (`createdAt`, `updatedAt`) used by all database entities.
    *   `exceptions/`: Global exception handling logic to ensure consistent API error responses.
*   **`security/`**: The core security layer of the application.
    *   `auth/`: Handles authentication logic (Login, Logout, Password Reset, Refresh Token).
    *   `user/` & `role/`: Manages user accounts and Role-Based Access Control (RBAC).
    *   `JwtService.java` & `JwtCookieFilter.java`: Logic for generating, validating, and extracting JWTs from secure cookies.
*   **`academic/`**: Manages the university's hierarchical structure.
    *   `department/`, `speciality/`, `program/`: Organizational units of the university.
    *   `academic_class/`, `academic_year/`, `semester/`: Temporal and structural units of study.
*   **`student_managment/`**: Dedicated to student life cycles.
    *   `student/`: Core student profile management.
    *   `enrollment/`: Tracks student registrations and their status (Active, Completed, etc.).
    *   `student_group/`: Handles grouping of students for classes and exams.
*   **`teaching/`**: Focuses on the educational delivery.
    *   `teacher/`: Management of faculty profiles.
    *   `subject/` & `course/`: The curriculum and specific course instances.
    *   `teacher_assignment/`: Links teachers to specific courses and groups.
*   **`evaluation/`**: Handles the assessment process.
    *   `exam/`: Management of examination instances and sessions.
    *   `grade/`: Recording and validating student performance.

### 📂 `src/main/resources/`
*   **`db/migration/`**: Contains **Flyway** SQL scripts for version-controlled database schema updates.
*   **`templates/`**: HTML templates (Thymeleaf) used primarily for generating professional system emails (e.g., password reset).
*   *   **`application.yaml` / `application-dev.yaml`**: Configuration files for different environments (Database URLs, JWT secrets, Mail server settings).
*   **`keystore.p12`**: Secure certificate for local HTTPS/SSL development.

### 📂 `data/` & `entities_list.txt`
*   Contains static SQL data scripts and documentation for bulk entity management and initial database population.

---

## 🛠️ Getting Started

### Prerequisites
- **Java 17** or higher
- **Maven 3.x**
- **MySQL Server**

### Setup & Configuration
1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd gestion_universitaire/backend
    ```
2.  **Configure Database**:
    Update `src/main/resources/application.properties` (or `application.yml`) with your MySQL credentials.
3.  **Generate SSL Certificate**:
    Generate a self-signed certificate for local HTTPS development:
    ```bash
    keytool -genkeypair -alias university -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore keystore.p12 -validity 3650
    ```

### Running the Application
```bash
./mvnw spring-boot:run
```
The server will start on [https://localhost:8443](https://localhost:8443) (or configured port).

---

## 📖 API Documentation
Once the application is running, you can access the Swagger UI to explore and test the endpoints:
- **Swagger UI**: [https://localhost:8443/swagger-ui.html](https://localhost:8443/swagger-ui.html)
- **OpenAPI Specs**: [https://localhost:8443/v3/api-docs](https://localhost:8443/v3/api-docs)

---

## ✅ Recent Enhancements (Work Done So Far)

As part of the recent development phase, we have:
1.  **Structural Refactoring**: Removed redundant `TeachingAssignment` entities and cleaned up the teaching module for better relational coherence.
2.  **Security Hardening**: Implemented Refresh Token rotation and fixed session-related bugs (`LazyInitializationException`).
3.  **API Standardization**: Generated and implemented DTOs for all entities to prevent exposing internal database schemas.
4.  **Data Population**: Integrated SQL scripts for realistic data injection.
5.  **Fixed Core Endpoints**: Resolved routing issues in `UserController` and `AuthController`.

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
