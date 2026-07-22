# Candidate Information

**Name:** Akriti Chandra  
**Role:** Senior Software Engineer  
**Primary Technology Stack:** Java 21, Spring Boot 3.3, Gradle, PostgreSQL, React 19, TypeScript, Vite, MUI

**Primary AI Tool Used:** Cursor  
**Project Option Selected:** Support Ticket Management System

**Assessment Start Date:** July 13, 2026  
**Submission Date:** July 22, 2026

## Project Summary

A full-stack **Support Ticket Management System** for internal support workflows. Employees raise tickets; support agents work them through an enforced status lifecycle (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`, with cancellation from `OPEN` or `IN_PROGRESS`). The Spring Boot backend owns all business rules; the React frontend renders only transitions returned in `allowedNextStatuses`.

**Deliverables:** REST API with Swagger, React SPA (list/create/detail/edit), PostgreSQL schema and seed data, backend integration tests, frontend Vitest component tests, and assignment documentation.

## Tools Used

| Category | Tools |
|----------|-------|
| Backend | Java 21, Spring Boot 3.3, Spring Data JPA, Gradle, PostgreSQL |
| Frontend | React 19, TypeScript, Vite, MUI, Axios, React Router |
| Testing | JUnit 5, Mockito, MockMvc, Vitest, React Testing Library |
| API docs | SpringDoc OpenAPI (Swagger UI) |
| AI | Cursor (planning, scaffolding, implementation, debugging, documentation) |
| IDE / OS | Windows, PowerShell |

## Setup Summary

1. Install Java 21, Node.js 18+, npm, and PostgreSQL 14+.
2. Create database: `CREATE DATABASE ticket_management;`
3. Set `SPRING_DATASOURCE_*` env vars if local PostgreSQL credentials differ from defaults in `application.yml`.
4. Start backend: `cd backend` → `.\gradlew.bat bootRun` (API at http://localhost:8080/api).
5. Start frontend: `cd frontend` → `npm install` → `npm run dev` (UI at http://localhost:5173).
6. Run tests: `.\gradlew.bat test` (backend, requires PostgreSQL) and `npm test` (frontend).

See `README.md` for full setup, environment variables, and API endpoint reference.
