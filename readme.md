# Gestion Universite

A full-stack university management platform with a Spring Boot backend and an Angular frontend.

## Repository Analysis Summary

I reviewed the repository layout and key configuration files to produce this consolidated README.

### High-level inventory
- **Total tracked project files (excluding `.git`, `node_modules`, `target`)**: 277
- **Backend files**: 169
- **Frontend files**: 104
- **Most common file types**:
  - `.java` (133)
  - `.ts` (47)
  - `.html` (20)
  - `.sql` (19)
  - `.scss` (19)

## Architecture Overview

## 1) Backend (`/backend`)

A Spring Boot 3.2.5 API organized by domains:
- `academic` (departments, programs, specialities, classes, academic years)
- `student_managment` (students, groups, enrollments)
- `teaching` (teachers, subjects, courses)
- `evaluation` (exams, grades)
- `security` (auth, users, roles, JWT, filters)
- `core` (base entity + global exception handling)

### Backend stack
- Java 17
- Spring Boot 3.2.5
- Spring Data JPA + Hibernate
- Spring Security + JWT (`jjwt`)
- Flyway migrations
- MySQL (runtime) + H2 (tests)
- Spring Mail
- Springdoc OpenAPI/Swagger
- Actuator

### Key backend API roots
- `/api/v1/auth` (login, refresh, reset-password, me, logout)
- `/api/v1/admin/*` (admin-protected CRUD endpoints)
- `api/v1/teachers/*` (teacher exam/grade routes)

### Security behavior
- Public: `/api/v1/auth/**`, Swagger/OpenAPI routes, H2 console
- Protected: everything else
- Role-protected: `/api/v1/admin/**` requires `ROLE_ADMIN`

## 2) Frontend (`/frontend`)

Angular 20 application with modular feature routing.

### Frontend stack
- Angular 20
- Angular Router
- RxJS
- Tailwind/PostCSS toolchain
- Karma + Jasmine for unit tests

### Main routes
- `/auth` (login, forgot-password, reset-password)
- `/admins` (dashboard + user management, guarded for admins)
- `/test` (test component route)

### Environment configuration
- Dev API URL: `https://localhost:8080/api/v1/`
- Prod API URL: `/api/v1/`

## 3) Deployment & Operations

### Docker Compose (production-oriented)
`docker-compose-prod.yml` defines:
- `backend` container (health check via `/actuator/health`)
- `frontend` container exposed on ports `80` and `443`
- `mysql:8.0` on host port `3308`

### TLS / cert artifacts
The repository includes keystore/cert files used for HTTPS and trust setup in backend/deployment workflows.

## Getting Started

## Prerequisites
- Java 17+
- Node.js 20+
- npm
- Maven 3+
- MySQL 8 (or Docker)

## Option A: Run locally (backend + frontend)

### 1. Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 2. Frontend
```bash
cd frontend
npm install
npm run start
```

Frontend default: `http://localhost:4200`

## Option B: Run with containers
```bash
docker compose -f docker-compose-prod.yml up -d
```

## Development Commands

### Backend
```bash
cd backend
./mvnw test
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run start
npm run build
npm run test
```

## Database Migrations

Flyway SQL migration scripts are located in:
- `backend/src/main/resources/db/migration`

## Existing Documentation

- Backend detailed notes: `backend/README.md`
- Frontend default Angular notes: `frontend/README.md`

## Notes

- The backend codebase uses domain-driven folder grouping and a controller → service → repository layering.
- The frontend currently implements authentication and core admin workflows (dashboard and user management), with student/admin modules scaffolded under feature folders.
- There is a typo retained from source naming: `student_managment` (without second "e") in package paths.
