# README setup instructions
_Exported on 7/22/2026 at 19:25:07 GMT+5:30 from Cursor (3.6.31)_

---

**User**

Implement the following to-dos from the plan (the plan is attached for your reference). Do NOT edit the plan file itself.

You have been assigned the following 1 to-do(s) with IDs: readme

1. [readme] Write README with local PostgreSQL setup, env vars, and run instructions for both apps

These to-dos have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the assigned to-dos.

---

**Cursor**

I'll mark the README task in progress and inspect the project structure and config so the setup and run instructions match the repo.


Creating the root README from the project configuration and plan.


The README is in place at `README.md`. Here's what it covers:

**What changed**
- Added `README.md` at the project root with setup and run instructions for both apps.

**Contents**
- **Prerequisites** — Java 21, Node.js, PostgreSQL
- **PostgreSQL setup** — `CREATE DATABASE ticket_management`, plus optional manual `schema.sql` / `data.sql` usage
- **Environment variables**
  - Backend: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` (matching `application.yml` defaults: `postgres` / `Password`)
  - Tests: `DB_USERNAME`, `DB_PASSWORD` (from the test profile)
  - Frontend: `VITE_API_BASE_URL` (defaults to `http://localhost:8080/api`)
- **Run instructions** — `gradlew.bat bootRun` for backend, `npm install && npm run dev` for frontend
- **API reference** — endpoint table, Swagger URLs
- **Seed data** — what `data.sql` provides
- **Local workflow** — step-by-step startup order

The README reflects the actual codebase (e.g. `gradlew.bat` on Windows, hardcoded defaults in `application.yml`, CORS for port 5173) rather than only the plan's aspirational env-var placeholders.

