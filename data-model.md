# Data Model

Entity-relationship model and field definitions for the Support Ticket Management System (PostgreSQL).

## Entity-relationship diagram

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ role            │
└────────┬────────┘
         │
         │ 1
         │
         ├──────────────────────────────┐
         │                              │
         │ *                            │ *
┌────────▼────────┐            ┌────────▼────────┐
│    tickets      │            │    comments     │
│─────────────────│            │─────────────────│
│ id (PK)         │◄───────────│ ticket_id (FK)  │
│ title           │     1    * │ id (PK)         │
│ description     │            │ message         │
│ priority        │            │ created_by (FK) │
│ status          │            │ created_at      │
│ assigned_to(FK) │            └────────┬────────┘
│ created_by (FK) │                     │
│ created_at      │                     │ *
│ updated_at      │                     │
└─────────────────┘                     │ 1
                                        │
                               ┌────────▼────────┐
                               │     users       │
                               └─────────────────┘
```

**Relationships:**

| From | To | Cardinality | Notes |
|------|-----|-------------|-------|
| `users` | `tickets.assigned_to` | 1 : N | Every ticket has one assignee |
| `users` | `tickets.created_by` | 1 : N | Every ticket has one creator |
| `tickets` | `comments.ticket_id` | 1 : N | ON DELETE CASCADE |
| `users` | `comments.created_by` | 1 : N | Every comment has one author |

---

## Entities

### User

Represents an internal employee, support agent, or administrator.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK | Auto-generated identifier |
| `name` | `VARCHAR(100)` | NOT NULL | Display name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Login identifier (not used for auth in this scope) |
| `role` | `VARCHAR(50)` | NOT NULL | See `UserRole` enum |

**JPA entity:** `com.ticketsystem.entity.User`

### Ticket

Core support request with metadata and workflow status.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK | Auto-generated identifier |
| `title` | `VARCHAR(200)` | NOT NULL | Short summary (max 200 chars) |
| `description` | `TEXT` | NOT NULL | Full problem description |
| `priority` | `VARCHAR(20)` | NOT NULL, CHECK | See `TicketPriority` enum |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT `OPEN`, CHECK | See `TicketStatus` enum |
| `assigned_to` | `BIGINT` | NOT NULL, FK → `users.id` | Support agent responsible |
| `created_by` | `BIGINT` | NOT NULL, FK → `users.id` | Employee who raised the ticket |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | Last modification timestamp |

**JPA entity:** `com.ticketsystem.entity.Ticket`

**Business rules:**

- Status is always `OPEN` on creation (set by the server, not the client).
- Status changes go through `PATCH /api/tickets/{id}/status` only — not via `PUT`.
- `updated_at` is refreshed on any ticket or status change.

### Comment

Threaded note on a ticket.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK | Auto-generated identifier |
| `ticket_id` | `BIGINT` | NOT NULL, FK → `tickets.id` ON DELETE CASCADE | Parent ticket |
| `message` | `TEXT` | NOT NULL | Comment body |
| `created_by` | `BIGINT` | NOT NULL, FK → `users.id` | Author |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | Creation timestamp |

**JPA entity:** `com.ticketsystem.entity.Comment`

**Ordering:** Comments are returned newest first (`created_at DESC`).

---

## Enumerations

### UserRole

| Value | Description |
|-------|-------------|
| `EMPLOYEE` | Raises tickets |
| `SUPPORT_AGENT` | Assigned to resolve tickets |
| `ADMIN` | Administrative user (seeded; not enforced in API) |

### TicketPriority

| Value | Description |
|-------|-------------|
| `LOW` | Non-urgent |
| `MEDIUM` | Standard priority |
| `HIGH` | Urgent |
| `CRITICAL` | Business-critical |

Enforced at DB level via `CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL'))`.

### TicketStatus

| Value | Description |
|-------|-------------|
| `OPEN` | Newly created, not yet worked |
| `IN_PROGRESS` | Actively being handled |
| `RESOLVED` | Fix delivered, awaiting closure |
| `CLOSED` | Terminal — completed |
| `CANCELLED` | Terminal — withdrawn |

Enforced at DB level via `CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED','CANCELLED'))`.

### Status transition matrix

Valid transitions are enforced in `TicketStatusTransitionValidator` (application layer), not in the database.

| From | Allowed to |
|------|------------|
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |
| `CLOSED` | *(none — terminal)* |
| `CANCELLED` | *(none — terminal)* |

The API exposes valid next statuses on every ticket response as `allowedNextStatuses`.

---

## Indexes

| Index | Table | Column(s) | Purpose |
|-------|-------|-----------|---------|
| `idx_tickets_status` | `tickets` | `status` | Filter list by status |
| `idx_tickets_assigned_to` | `tickets` | `assigned_to` | Assignee lookups |
| `idx_comments_ticket_id` | `comments` | `ticket_id` | Load comments per ticket |

---

## API DTO mapping

| Entity | API response DTO | Notes |
|--------|------------------|-------|
| `User` | `UserSummary` | `{ id, name }` — nested in ticket/comment responses |
| `Ticket` | `TicketResponse` | Full detail + `allowedNextStatuses` |
| `Ticket` (list) | `TicketSummary` | Subset for paginated list |
| `Comment` | `CommentResponse` | Includes nested `createdBy` |

Request DTOs (`CreateTicketRequest`, `UpdateTicketRequest`, `UpdateTicketStatusRequest`, `CreateCommentRequest`) are separate from entities and validated with Jakarta Bean Validation.

---

## Seed data

Defined in `database/seed-data/` and `backend/src/main/resources/data.sql`:

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 6 | 3 employees, 2 agents, 1 admin |
| Tickets | 4 | Sample tickets across statuses (see `database/setup-notes.md`) |
| Comments | 4 | Linked to sample tickets |

All seed inserts are idempotent (`ON CONFLICT DO NOTHING` / `NOT EXISTS`).

---

## Schema sources

| Location | Purpose |
|----------|---------|
| `database/schema-or-migrations/001_initial_schema.sql` | Standalone DDL for manual setup |
| `backend/src/main/resources/schema.sql` | Classpath DDL run by Spring Boot on startup |
| `database/setup-notes.md` | Setup and reset instructions |
