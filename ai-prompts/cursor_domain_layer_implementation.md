# Domain layer implementation
_Exported on 7/22/2026 at 19:23:23 GMT+5:30 from Cursor (3.6.31)_

---

**User**

Implement the following to-dos from the plan (the plan is attached for your reference). Do NOT edit the plan file itself.

You have been assigned the following 1 to-do(s) with IDs: domain-layer

1. [domain-layer] Implement User, Ticket, Comment entities, enums, JPA repositories, schema.sql DDL, and data.sql seed (5+ users)

These to-dos have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the assigned to-dos.

---

**Cursor**

Implementing the domain layer per the plan. Exploring the codebase and marking the todo in progress.


Creating enums, entities, repositories, and SQL files per the plan.


Verifying the project compiles and tests pass:


The **domain-layer** todo is complete. Here is what was added:

### Enums (`com.ticketsystem.entity`)
- `UserRole` — `EMPLOYEE`, `SUPPORT_AGENT`, `ADMIN`
- `TicketPriority` — `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `TicketStatus` — `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`

### Entities
- **`User`** — `id`, `name`, `email`, `role` mapped to `users`
- **`Ticket`** — title, description, priority, status (default `OPEN`), `assignedTo` / `createdBy` (`@ManyToOne`), `createdAt` / `updatedAt` (`@CreationTimestamp` / `@UpdateTimestamp`)
- **`Comment`** — ticket, message, `createdBy`, `createdAt`

All enum fields use `@Enumerated(EnumType.STRING)` to match the VARCHAR + CHECK constraints in SQL.

### Repositories
- `UserRepository` — `JpaRepository` + `findByEmail`
- `TicketRepository` — `JpaRepository`
- `CommentRepository` — `JpaRepository` + `findByTicketIdOrderByCreatedAtDesc`

### SQL
- **`schema.sql`** — full DDL for `users`, `tickets`, `comments`, indexes, and foreign keys (per plan)
- **`data.sql`** — 6 seed users (2 employees, 2 support agents, 1 admin, 1 extra employee), 2 sample tickets, and 2 sample comments; idempotent via `ON CONFLICT` / `NOT EXISTS`

### Verification
`.\gradlew.bat compileJava test` completed successfully.

On first backend startup against PostgreSQL, `schema.sql` runs before `data.sql`, and Hibernate `ddl-auto: validate` checks that entities match the schema.

