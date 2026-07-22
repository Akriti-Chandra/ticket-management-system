# Design Notes

## Architecture Overview (frontend, backend, database)

The application follows a classic three-tier architecture: a React SPA talks to a Spring Boot REST API, which persists data in PostgreSQL.

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + TypeScript + Vite + MUI)                 │
│  localhost:5173                                               │
│  Pages → API modules (Axios) → REST calls                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSON  (CORS: localhost:5173)
┌──────────────────────────▼──────────────────────────────────┐
│  Backend (Spring Boot 3.3 + Java 21)                         │
│  localhost:8080/api                                          │
│  Controller → Service → Repository → JPA Entities          │
│  Validation + GlobalExceptionHandler at API boundary         │
└──────────────────────────┬──────────────────────────────────┘
                           │ JDBC
┌──────────────────────────▼──────────────────────────────────┐
│  PostgreSQL (ticket_management)                               │
│  users · tickets · comments                                   │
└───────────────────────────────────────────────────────────────┘
```

**Key design principle:** The backend is the single source of truth for business rules. The frontend never decides which status transitions are valid — it renders actions from `allowedNextStatuses` returned by the API.

**Layer responsibilities:**

| Layer | Responsibility |
|-------|----------------|
| Frontend | UI rendering, form input, API calls, user feedback (snackbars, field errors) |
| Controller | HTTP mapping, request validation (`@Valid`), DTO ↔ response mapping |
| Service | Business logic, status transition validation, transaction boundaries |
| Repository | Data access, search queries, eager-fetch for related entities |
| Database | Persistence, referential integrity, enum constraints |

## Frontend Design

### Structure

```
frontend/src/
├── api/           # Axios client + per-resource API functions
├── components/    # Shared UI (AppSnackbar)
├── hooks/         # useSnackbar, useDebounce
├── layouts/       # MainLayout (app shell + nav)
├── pages/         # Route-level page components
├── routes/        # React Router configuration
├── types/         # TypeScript interfaces matching API DTOs
└── utils/         # statusUtils, dateUtils, errorUtils
```

### Routing

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `TicketListPage` | Paginated list with keyword search and status filter |
| `/tickets/new` | `CreateTicketPage` | Create ticket form |
| `/tickets/:id` | `TicketDetailPage` | Detail, status actions, comments |
| `/tickets/:id/edit` | `EditTicketPage` | Edit metadata (not status) |

All routes are nested under `MainLayout` for consistent navigation.

### API integration

- **HTTP client:** Axios instance in `axiosClient.ts` with base URL from `VITE_API_BASE_URL` (default `http://localhost:8080/api`).
- **Resource modules:** `ticketsApi.ts`, `commentsApi.ts`, `usersApi.ts` — thin wrappers around REST endpoints.
- **Types:** `types/index.ts` mirrors backend response shapes, including `allowedNextStatuses` on `Ticket`.

### Status actions (critical design decision)

`TicketDetailPage` reads `ticket.allowedNextStatuses` from the API and renders one button per allowed transition. No transition logic is duplicated in the frontend:

```typescript
const allowedStatuses = Array.from(ticket.allowedNextStatuses ?? []);
// Buttons rendered only when allowedStatuses.length > 0
```

`statusUtils.ts` provides display helpers only (labels, chip colors) — not business rules.

### UX patterns

- **Debounced search** on the list page (`useDebounce`) to avoid excessive API calls.
- **Snackbar feedback** for success and error messages via `useSnackbar` + `AppSnackbar`.
- **Field-level errors** parsed from `ValidationErrorResponse` via `getFieldErrors()`.
- **Loading states** with `CircularProgress` during data fetch and status updates.

## Backend Design

### Package structure

```
com.ticketsystem/
├── config/        # CORS, OpenAPI
├── controller/    # REST endpoints (Ticket, Comment, User)
├── dto/
│   ├── request/   # CreateTicketRequest, UpdateTicketRequest, etc.
│   └── response/  # TicketResponse, PageResponse, ErrorResponse, etc.
├── entity/        # JPA entities + enums
├── exception/     # Custom exceptions + GlobalExceptionHandler
├── mapper/        # Entity → DTO mapping (static utility classes)
├── repository/    # Spring Data JPA interfaces
├── service/       # Business logic
└── validation/    # TicketStatusTransitionValidator
```

### API design

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/api/tickets` | Creates ticket with status `OPEN` |
| `GET` | `/api/tickets` | Search with `keyword`, `status`, `page`, `size` |
| `GET` | `/api/tickets/{id}` | Returns `allowedNextStatuses` |
| `PUT` | `/api/tickets/{id}` | Updates fields only — status excluded |
| `PATCH` | `/api/tickets/{id}/status` | Dedicated status change endpoint |
| `POST` | `/api/tickets/{id}/comments` | Add comment |
| `GET` | `/api/tickets/{id}/comments` | List comments (newest first) |
| `GET` | `/api/users` | List users for dropdowns |

**Separation of update vs. status change:** `PUT` cannot change status; only `PATCH /status` can. This keeps the state machine in one code path (`TicketService.updateStatus` → `TicketStatusTransitionValidator`).

### Status state machine

Centralized in `TicketStatusTransitionValidator`:

| From | Allowed to |
|------|------------|
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |
| `CLOSED`, `CANCELLED` | *(none)* |

`TicketController` attaches `allowedNextStatuses` to every `TicketResponse` so the frontend always has current valid actions.

### Data access

- `TicketRepository.findByIdWithUsers` — `JOIN FETCH` for assignee and creator on detail views.
- `TicketRepository.search` — dynamic JPQL with optional keyword (title/description, case-insensitive `LIKE`) and status filter; `@EntityGraph` for assignee on list queries.
- List results sorted by `updatedAt DESC`.

### Cross-cutting concerns

- **CORS:** `CorsConfig` allows `http://localhost:5173` on `/api/**`.
- **OpenAPI:** Swagger UI at `/swagger-ui.html` for API exploration.
- **Transactions:** `@Transactional` on service write methods; read-only on queries.

## Database Design

### Entity-relationship model

```
users (1) ──< tickets.assigned_to
users (1) ──< tickets.created_by
tickets (1) ──< comments.ticket_id  (ON DELETE CASCADE)
users (1) ──< comments.created_by
```

### Tables

**`users`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGSERIAL` | PK |
| `name` | `VARCHAR(100)` | NOT NULL |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE |
| `role` | `VARCHAR(50)` | NOT NULL (`EMPLOYEE`, `SUPPORT_AGENT`, `ADMIN`) |

**`tickets`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGSERIAL` | PK |
| `title` | `VARCHAR(200)` | NOT NULL |
| `description` | `TEXT` | NOT NULL |
| `priority` | `VARCHAR(20)` | CHECK: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `status` | `VARCHAR(20)` | DEFAULT `OPEN`; CHECK: valid statuses |
| `assigned_to` | `BIGINT` | FK → `users(id)` |
| `created_by` | `BIGINT` | FK → `users(id)` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |

**`comments`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGSERIAL` | PK |
| `ticket_id` | `BIGINT` | FK → `tickets(id)` ON DELETE CASCADE |
| `message` | `TEXT` | NOT NULL |
| `created_by` | `BIGINT` | FK → `users(id)` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |

### Indexes

- `idx_tickets_status` — filter by status on list page.
- `idx_tickets_assigned_to` — assignee lookups.
- `idx_comments_ticket_id` — comment list per ticket.

### Initialization

- `schema.sql` — DDL (tables, constraints, indexes).
- `data.sql` — idempotent seed data (users, sample tickets, comments) via `ON CONFLICT` / `NOT EXISTS`.

## Validation Strategy

Validation is applied at multiple layers for defense in depth:

| Layer | What is validated | How |
|-------|-------------------|-----|
| **Request DTO** | Required fields, string length, enum types | Jakarta Bean Validation (`@NotBlank`, `@NotNull`, `@Size`) on request records; triggered by `@Valid` in controllers |
| **Service** | Status transitions, resource existence | `TicketStatusTransitionValidator.validate()`; `findUserOrThrow` / `findTicketOrThrow` |
| **Database** | Enum values, referential integrity | `CHECK` constraints on `priority`/`status`; foreign keys on `assigned_to`, `created_by`, `ticket_id` |

**Frontend validation** is minimal and UX-focused (required form fields before submit). The backend always re-validates — the UI does not trust client-side checks alone.

**Status transition validation** is the most critical rule: invalid transitions throw `InvalidStatusTransitionException` before `ticket.setStatus()` is called, so the database is never updated on failure.

## Error Handling Strategy

### Backend (`GlobalExceptionHandler`)

| Exception | HTTP status | Response shape |
|-----------|-------------|----------------|
| `MethodArgumentNotValidException` | `400` | `ValidationErrorResponse` — message + `errors[]` with `field` and `message` |
| `InvalidStatusTransitionException` | `400` | `ErrorResponse` — e.g. `"Cannot transition from OPEN to CLOSED"` |
| `ResourceNotFoundException` | `404` | `ErrorResponse` — e.g. `"Ticket not found with id: 99"` |
| Unhandled `Exception` | `500` | `ErrorResponse` — generic message; stack trace logged server-side only |

All error responses use a consistent JSON shape so the frontend can parse them uniformly.

### Frontend (`errorUtils.ts`)

- `getErrorMessage(error)` — extracts human-readable message from validation, API, or network errors.
- `getFieldErrors(error)` — maps `ValidationErrorResponse.errors` to `{ field: message }` for inline form display.
- Network failures (no response) show `"Unable to reach server"`.
- Errors are surfaced via snackbars (global) and inline field errors (forms).

## Testing Strategy Link

Testing follows a pyramid aligned with the layered architecture:

| Level | Location | What it covers |
|-------|----------|----------------|
| **Unit** | `TicketStatusTransitionValidatorTest` | All allowed and disallowed transitions in isolation |
| **Service** | `TicketServiceTest` | Create, update, status change with mocked repositories |
| **Integration** | `TicketStatusTransitionIntegrationTest` | Full HTTP → service → DB path via `MockMvc`; verifies DB state after transitions |
| **Smoke** | `TicketManagementApplicationTests` | Application context loads |

**Integration test focus:** Every valid transition succeeds and persists; every invalid transition returns `400` with a descriptive message and leaves the DB unchanged. Validation and comment/user endpoints are also covered.

**How to run:**

```powershell
cd backend
.\gradlew.bat test
```

Requires PostgreSQL running locally with the `ticket_management` database (see `application-test.yml`).

**Traceability:** Tests map directly to items in `acceptance-criteria.md` (Core, Validation, Error Handling, Testing sections).

### Frontend tests

| Level | Location | What it covers |
|-------|----------|----------------|
| **Component** | `frontend/src/**/*.test.tsx`, `*.test.ts` | Pages (list, create, detail, edit), utilities, snackbar — mocked API |

**How to run:**

```bash
cd frontend
npm test
```

**Traceability:** `TicketDetailPage.test.tsx` verifies status buttons render from `allowedNextStatuses` only.
