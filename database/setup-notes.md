# Database Setup Notes

PostgreSQL database setup for the **Support Ticket Management System**.

## Overview

| Item | Value |
|------|-------|
| Database name | `ticket_management` |
| Engine | PostgreSQL 14+ |
| JDBC URL | `jdbc:postgresql://localhost:5432/ticket_management` |
| Default user | `postgres` |

The application uses **Spring SQL init** (not Flyway or Liquibase). On backend startup, Spring Boot runs the classpath scripts:

- `backend/src/main/resources/schema.sql`
- `backend/src/main/resources/data.sql`

The files in this `database/` folder are the **standalone, versioned copy** of the same schema and seed data. Use them when you want to initialize or reset the database manually with `psql`.

## Folder structure

```
database/
├── schema-or-migrations/   # DDL and future schema changes
│   └── 001_initial_schema.sql
├── seed-data/              # Idempotent seed scripts (run in order)
│   ├── 001_users.sql
│   ├── 002_tickets.sql
│   └── 003_comments.sql
└── setup-notes.md          # This file
```

## Quick start

### 1. Create the database

```sql
CREATE DATABASE ticket_management;
```

### 2. Apply schema

**Windows (PowerShell)**

```powershell
psql -U postgres -d ticket_management -f "database/schema-or-migrations/001_initial_schema.sql"
```

**macOS / Linux**

```bash
psql -U postgres -d ticket_management -f database/schema-or-migrations/001_initial_schema.sql
```

### 3. Load seed data (in order)

```bash
psql -U postgres -d ticket_management -f database/seed-data/001_users.sql
psql -U postgres -d ticket_management -f database/seed-data/002_tickets.sql
psql -U postgres -d ticket_management -f database/seed-data/003_comments.sql
```

### 4. Verify

```sql
\c ticket_management

SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS ticket_count FROM tickets;
SELECT COUNT(*) AS comment_count FROM comments;

SELECT t.title, t.status, t.priority, u.name AS assigned_to
FROM tickets t
JOIN users u ON u.id = t.assigned_to
ORDER BY t.updated_at DESC;
```

Expected seed counts after a fresh load:

| Table | Rows |
|-------|------|
| `users` | 6 |
| `tickets` | 4 |
| `comments` | 4 |

## Schema reference

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL | Primary key |
| `name` | VARCHAR(100) | Display name |
| `email` | VARCHAR(255) | Unique |
| `role` | VARCHAR(50) | `EMPLOYEE`, `SUPPORT_AGENT`, `ADMIN` |

### `tickets`

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL | Primary key |
| `title` | VARCHAR(200) | Max 200 characters |
| `description` | TEXT | Required |
| `priority` | VARCHAR(20) | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (CHECK) |
| `status` | VARCHAR(20) | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED` (CHECK) |
| `assigned_to` | BIGINT | FK → `users.id` |
| `created_by` | BIGINT | FK → `users.id` |
| `created_at` | TIMESTAMPTZ | Default `NOW()` |
| `updated_at` | TIMESTAMPTZ | Default `NOW()` |

### `comments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL | Primary key |
| `ticket_id` | BIGINT | FK → `tickets.id` (ON DELETE CASCADE) |
| `message` | TEXT | Required |
| `created_by` | BIGINT | FK → `users.id` |
| `created_at` | TIMESTAMPTZ | Default `NOW()` |

### Indexes

- `idx_tickets_status` on `tickets(status)`
- `idx_tickets_assigned_to` on `tickets(assigned_to)`
- `idx_comments_ticket_id` on `comments(ticket_id)`

## Seed data summary

### Users

| Name | Email | Role |
|------|-------|------|
| Alice Johnson | alice.johnson@example.com | EMPLOYEE |
| Bob Smith | bob.smith@example.com | EMPLOYEE |
| Carol Davis | carol.davis@example.com | SUPPORT_AGENT |
| David Wilson | david.wilson@example.com | SUPPORT_AGENT |
| Eve Admin | eve.admin@example.com | ADMIN |
| Frank Miller | frank.miller@example.com | EMPLOYEE |

### Sample tickets

| Title | Status | Priority | Created by | Assigned to |
|-------|--------|----------|------------|-------------|
| Cannot access email | OPEN | HIGH | Alice Johnson | Carol Davis |
| VPN connection drops frequently | IN_PROGRESS | MEDIUM | Bob Smith | David Wilson |
| Request new laptop | RESOLVED | LOW | Frank Miller | Carol Davis |
| Printer offline on 3rd floor | CLOSED | CRITICAL | Alice Johnson | David Wilson |

## Automatic initialization (recommended)

If you start the backend with `./gradlew bootRun` (or `gradlew.bat bootRun` on Windows), Spring Boot applies `schema.sql` and `data.sql` automatically. You only need manual scripts when:

- You want to inspect or edit SQL outside the JVM
- You are resetting a database without starting the backend
- You are onboarding someone who prefers `psql` over Gradle

Keep `database/` scripts in sync with `backend/src/main/resources/schema.sql` and `data.sql` when schema or seed data changes.

## Reset database

```sql
DROP DATABASE IF EXISTS ticket_management;
CREATE DATABASE ticket_management;
```

Then re-run the schema and seed scripts from steps 2–3 above.

## Connection configuration

Defaults are in `backend/src/main/resources/application.yml`:

| Setting | Default |
|---------|---------|
| URL | `jdbc:postgresql://localhost:5432/ticket_management` |
| Username | `postgres` |
| Password | `Password` |

Override with environment variables:

```powershell
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "your_password"
```

```bash
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=your_password
```

## Future migrations

This project does not use a migration framework yet. When adding schema changes:

1. Add a new numbered file under `schema-or-migrations/` (e.g. `002_add_ticket_tags.sql`)
2. Mirror the change in `backend/src/main/resources/schema.sql` for fresh installs
3. Document the change in this file
