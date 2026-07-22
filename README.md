# Support Ticket Management System

A full-stack support ticket application with a Spring Boot REST API and a React frontend. Tickets move through a enforced status workflow (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`, with cancellation from `OPEN` or `IN_PROGRESS`). The backend owns all business rules; the UI renders only the transitions the API allows.

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 21 |
| Node.js | 18+ (LTS recommended) |
| npm | 9+ |
| PostgreSQL | 14+ (installed locally) |

No Docker Compose is required — PostgreSQL is expected to run on your machine.

## Project structure

```
Ticket management System/
├── backend/     # Spring Boot 3.3 + Gradle (Java 21)
└── frontend/    # Vite + React + TypeScript + MUI
```

---

## PostgreSQL setup

1. Start your local PostgreSQL server.

2. Create the database:

```sql
CREATE DATABASE ticket_management;
```

3. On first backend startup, Spring Boot runs `backend/src/main/resources/schema.sql` (tables, constraints, indexes) and `backend/src/main/resources/data.sql` (seed users and sample tickets). You do not need to run these scripts manually unless you prefer to initialize the schema yourself:

```bash
psql -U postgres -d ticket_management -f backend/src/main/resources/schema.sql
psql -U postgres -d ticket_management -f backend/src/main/resources/data.sql
```

### Default connection

| Setting | Value |
|---------|-------|
| JDBC URL | `jdbc:postgresql://localhost:5432/ticket_management` |
| Username | `postgres` |
| Password | `Password` |

These defaults are defined in `backend/src/main/resources/application.yml`. Change them to match your local PostgreSQL credentials before starting the backend.

---

## Environment variables

### Backend

The main `application.yml` uses fixed defaults. Override them with standard Spring Boot environment variables (or edit `application.yml` directly):

| Variable | Purpose | Default |
|----------|---------|---------|
| `SPRING_DATASOURCE_URL` | JDBC connection URL | `jdbc:postgresql://localhost:5432/ticket_management` |
| `SPRING_DATASOURCE_USERNAME` | Database user | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `Password` |

**Windows (PowerShell)**

```powershell
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "your_password"
```

**macOS / Linux**

```bash
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=your_password
```

Integration tests use the `test` profile (`backend/src/test/resources/application-test.yml`) and also accept:

| Variable | Default |
|----------|---------|
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | `Password` |

Tests connect to the same `ticket_management` database on `localhost:5432`. Ensure PostgreSQL is running and the database exists before running `./gradlew test`.

### Frontend

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |

Create `frontend/.env.local` to override:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Running the backend

```bash
cd backend
```

**Windows**

```powershell
.\gradlew.bat bootRun
```

**macOS / Linux** (requires a Gradle installation if `gradlew` is not present)

```bash
gradle bootRun
```

The API starts on **http://localhost:8080**.

- REST base path: `/api`
- Swagger UI: **http://localhost:8080/swagger-ui.html**
- OpenAPI spec: **http://localhost:8080/v3/api-docs**

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/tickets` | Create ticket (status defaults to `OPEN`) |
| `GET` | `/api/tickets` | List/search tickets (`keyword`, `status`, `page`, `size`) |
| `GET` | `/api/tickets/{id}` | Ticket detail (includes `allowedNextStatuses`) |
| `PUT` | `/api/tickets/{id}` | Update title, description, priority, assignee |
| `PATCH` | `/api/tickets/{id}/status` | Change status (validated state machine) |
| `POST` | `/api/tickets/{id}/comments` | Add comment |
| `GET` | `/api/tickets/{id}/comments` | List comments (newest first) |
| `GET` | `/api/users` | List users (for assignee/creator dropdowns) |

### Run backend tests

```powershell
cd backend
.\gradlew.bat test
```

---

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

The UI is available at **http://localhost:5173**.

CORS is configured for `http://localhost:5173` in the backend, so the dev server works without extra proxy setup.

### Frontend routes

| Path | Page |
|------|------|
| `/` | Ticket list (search, status filter, pagination) |
| `/tickets/new` | Create ticket |
| `/tickets/:id` | Ticket detail (status actions, comments) |
| `/tickets/:id/edit` | Edit ticket fields (not status) |

### Production build

```bash
cd frontend
npm run build
npm run preview
```

### Run frontend tests

```bash
cd frontend
npm test
```

Vitest + React Testing Library cover pages, utilities, and shared components (mocked API). See `test-strategy.md` for details.

---

## Seed data

`data.sql` inserts six users with mixed roles (`EMPLOYEE`, `SUPPORT_AGENT`, `ADMIN`), **two** sample tickets (`OPEN`, `IN_PROGRESS`), and two comments. Inserts are idempotent (`ON CONFLICT` / `NOT EXISTS`), so restarting the backend does not duplicate seed rows.

> **Note:** The standalone scripts in `database/seed-data/` include four tickets and four comments for manual `psql` setup. If you want the same richer demo data on automatic startup, sync those inserts into `backend/src/main/resources/data.sql` (see `database/setup-notes.md`).

Example seeded users:

- `alice.johnson@example.com` — Employee
- `carol.davis@example.com` — Support agent
- `eve.admin@example.com` — Admin

There is no login screen; the UI lets you pick a user when creating tickets or comments.

---

## Typical local workflow

1. Create the `ticket_management` database in PostgreSQL.
2. Set `SPRING_DATASOURCE_*` variables if your credentials differ from the defaults.
3. Start the backend (`bootRun`) and wait for schema/seed initialization to finish.
4. In a second terminal, start the frontend (`npm run dev`).
5. Open http://localhost:5173, browse tickets, create or edit tickets, and use status buttons on the detail page (only valid transitions are shown).

---

## Out of scope

- Authentication / login
- User management UI
- Status change history
- Docker Compose
