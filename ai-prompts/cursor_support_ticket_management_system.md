# Support ticket management system
_Exported on 7/22/2026 at 19:21:28 GMT+5:30 from Cursor (3.6.31)_

---

**User**

You are a senior full-stack software engineer.
Build a production-quality Support Ticket Management System following clean architecturea, and best engineering practices.
Objective
Create a small application for managing internal support tickets.
Internal users can:
Create tickets
Update tickets
Assign tickets
Change ticket status
Add comments
Search tickets
Filter tickets
View ticket details
The application must enforce business rules on the backend.

Technology Stack
Use the following stack:
Frontend
React
Material UI 
React Router
Axios
Backend
Java
Spring Boot
Spring Data JPA
Hibernate
REST API
Bean Validation
Gradle
Database
PostgreSQL
Testing
JUnit 5
Spring Boot Test

Architecture
Use clean architecture with proper separation of concerns.
Backend structure:
controller
service
repository
entity
dto
mapper
exception
validation
config
util
Frontend structure:
src/
    api/
    components/
    pages/
    hooks/
    layouts/
    routes/
    types/
    services/
    utils/
Use DTOs instead of exposing entities.
Never expose JPA entities directly.

Business Context
This is an internal support ticket system.
Users already exist.
No authentication or login page is required.
Users are seeded into the database.
No user management UI is required.

Database Entities
User
Fields
id
name
email
role
Users are read-only.
Seed at least 5 users.

Ticket
Fields
id
title
description
priority
status
assignedTo
createdBy
createdAt
updatedAt
Relationships
assignedTo → User
createdBy → User

Comment
Fields
id
ticketId
message
createdBy
createdAt
Relationships
ticket → Ticket
createdBy → User

Ticket Priority
Use enum:
LOW
MEDIUM
HIGH
CRITICAL

Ticket Status
Use enum:
OPEN
IN_PROGRESS
RESOLVED
CLOSED
CANCELLED

Status State Machine (Mandatory)
The backend must strictly enforce these transitions.
Allowed:
OPEN
    -> IN_PROGRESS
    -> CANCELLED

IN_PROGRESS
    -> RESOLVED
    -> CANCELLED

RESOLVED
    -> CLOSED
Everything else is invalid.
Examples:
Not allowed:
OPEN -> CLOSED
OPEN -> RESOLVED
RESOLVED -> OPEN
CLOSED -> OPEN
CANCELLED -> OPEN
CLOSED -> IN_PROGRESS
The backend must reject invalid transitions.
Return HTTP 400 with a meaningful error message.
Example:
Cannot transition from OPEN to CLOSED
Frontend must display this error clearly.
This state machine is the most important business rule.
Implement it in a dedicated service or validator.
Do not scatter transition logic throughout the code.

Backend Features
Implement REST APIs for:
Tickets
Create ticket
POST /tickets
List tickets
GET /tickets
Ticket details
GET /tickets/{id}
Update ticket
PUT /tickets/{id}
Update status
PATCH /tickets/{id}/status
Search
GET /tickets?keyword=&status=

Comments
Create comment
POST /tickets/{id}/comments
List comments
GET /tickets/{id}/comments

Users
Read only
GET /users

Backend Validation
Use Bean Validation.
Required:
Title
mandatory
max length 200
Description
mandatory
Priority
mandatory
Assigned user
must exist
CreatedBy
must exist
Comment
cannot be empty
Reject invalid payloads.
Return structured validation errors.
Example:
{
  "message":"Validation Failed",
  "errors":[
      {
          "field":"title",
          "message":"must not be blank"
      }
  ]
}

Persistence
Persist data in PostgreSQL.
Data must survive application restart.
Provide:
schema generation
seed data
Frontend Features
Pages
Ticket List
Show
Title
Priority
Status
Assignee
Updated Date
Features
Search
Filter by status
Pagination (optional)
Refresh

Ticket Detail
Show
All ticket information
Comments
Status history (optional)
Buttons for valid status transitions

Create Ticket
Form
title
description
priority
assignee
creator
Validation
Show field errors.

Edit Ticket
Editable
title
description
priority
assignee

Status Change
Allow changing status only.
Display only valid next states.
If backend rejects,
Show error notification.

Comments
Show all comments.
Allow adding new comment.
Newest first.

Error Handling
Frontend should display
Validation errors
Backend business errors
Network errors
Empty state
Loading state
Use Snackbar/Toast notifications.

Search
Support keyword search on
title
description
Support filter
status
Allow combining both.

Repository Layer
Use Spring Data JPA.
Avoid business logic in repositories.

Service Layer
Contains all business logic.
Especially
Status transition validation.

Integration Tests (Mandatory)
Write integration tests proving the state machine.
Tests must verify:
Valid transitions
OPEN -> IN_PROGRESS

IN_PROGRESS -> RESOLVED

RESOLVED -> CLOSED

OPEN -> CANCELLED

IN_PROGRESS -> CANCELLED
Invalid transitions
OPEN -> CLOSED

OPEN -> RESOLVED

RESOLVED -> OPEN

CANCELLED -> OPEN

CLOSED -> IN_PROGRESS
Tests must assert
HTTP response
Database state
Error message

Additional Best Practices
Use:
Lombok
Global Exception Handler
DTO Mapping
RESTful naming
Logging
Clean code
Java records where appropriate
Immutable DTOs where possible

API Documentation
Generate Swagger/OpenAPI documentation.




---

**Cursor**

I'll explore the workspace to see what's already there, then draft a concrete implementation plan for the ticket system.


The workspace is empty — greenfield build. I'll draft a full-stack plan from your requirements.


**Project setup preferences**

> **How should the backend and frontend be organized in this repo?**
> - Monorepo: backend/ and frontend/ folders (Recommended) ✔
> - Backend first — scaffold frontend in a later step
> - Separate top-level folders with shared docker-compose at root

> **How should PostgreSQL be provided for local development?**
> - Docker Compose file at repo root (Recommended)
> - Assume PostgreSQL is already installed locally — document connection settings only ✔
> - H2 for local dev, PostgreSQL only for integration tests (Testcontainers)

---

**User**

create schema.sql also 

---

**Cursor**

I'll update the plan to include an explicit `schema.sql` for database setup.


Updated the plan to include an explicit **`schema.sql`**. Summary of what changed:

### Database initialization strategy

| File | Role |
|------|------|
| **`schema.sql`** | Source of truth for DDL — `users`, `tickets`, `comments` tables, CHECK constraints for enums, foreign keys, and indexes |
| **`data.sql`** | Seed data — 5+ users (idempotent inserts) |
| **`application.yml`** | `spring.sql.init.schema-locations` + `data-locations`; Hibernate `ddl-auto: validate` (no auto table generation) |

### Startup order
1. `schema.sql` runs (CREATE TABLE IF NOT EXISTS)
2. `data.sql` runs (seed users)
3. Hibernate validates entity mappings against the existing schema

### Schema highlights
- Enum values enforced at DB level via `CHECK` constraints (`priority`, `status`)
- Foreign keys: `tickets.assigned_to` / `created_by` → `users`, `comments.ticket_id` → `tickets`
- Indexes on `tickets.status`, `tickets.assigned_to`, `comments.ticket_id`

The README section also notes that tables are created automatically on first `bootRun`, or can be applied manually with `psql`.

Say **"go ahead and implement"** when you're ready to start building.

