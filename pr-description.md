# PR Description

## Summary

This PR delivers a full-stack **Support Ticket Management System** — a Spring Boot REST API and React SPA for creating, tracking, and resolving internal support tickets. The backend enforces a strict ticket status workflow; the frontend renders only the transitions the API allows via `allowedNextStatuses`.

**Stack:** Java 21 · Spring Boot 3.3 · Gradle · PostgreSQL · React 19 · TypeScript · Vite · MUI · Axios

**Assessment period:** July 13 – July 19, 2026  
**Primary AI tool:** Cursor

---

## Features Implemented

### Ticket management
- Create tickets (title, description, priority, assignee, creator) — default status `OPEN`
- List tickets with keyword search (title/description), status filter, and pagination
- View ticket detail with assignee, creator, timestamps, and allowed next statuses
- Update ticket metadata (title, description, priority, assignee) — status excluded from `PUT`
- Change ticket status via dedicated `PATCH /api/tickets/{id}/status` endpoint

### Status workflow (server-enforced)
| From | Allowed to |
|------|------------|
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |
| `CLOSED`, `CANCELLED` | *(terminal)* |

### Comments
- Add comments to any ticket (message + author)
- List comments newest first

### Users
- List seeded users for assignee/creator/comment-author dropdowns
- Roles in data model: `EMPLOYEE`, `SUPPORT_AGENT`, `ADMIN` (not enforced)

### Frontend pages
| Route | Page |
|-------|------|
| `/` | Ticket list (search, filter, pagination) |
| `/tickets/new` | Create ticket |
| `/tickets/:id` | Detail — status actions, comments |
| `/tickets/:id/edit` | Edit metadata |

---

## Technical Changes

### Backend (`backend/`)

| Layer | Changes |
|-------|---------|
| **Entities** | `User`, `Ticket`, `Comment` + enums (`TicketStatus`, `TicketPriority`, `UserRole`) |
| **Repositories** | `TicketRepository` with `search()` and `findByIdWithUsers()` (`JOIN FETCH`) |
| **Validation** | `TicketStatusTransitionValidator` — central transition map |
| **Services** | `TicketService`, `CommentService`, `UserService` |
| **Controllers** | REST endpoints under `/api` for tickets, comments, users |
| **DTOs** | Request/response records with Jakarta Bean Validation |
| **Exception handling** | `GlobalExceptionHandler` — 400 validation, 400 invalid transition, 404, 500 |
| **Config** | CORS for `localhost:5173`, OpenAPI/Swagger |
| **JPA** | `open-in-view: false`, `ddl-auto: validate`, SQL init from `schema.sql` / `data.sql` |

### Frontend (`frontend/`)

| Area | Changes |
|------|---------|
| **Scaffold** | Vite + React + TypeScript + MUI |
| **Routing** | React Router with `MainLayout` shell |
| **API** | Axios client + `ticketsApi`, `commentsApi`, `usersApi` |
| **Types** | TypeScript interfaces mirroring backend DTOs |
| **Pages** | List, create, detail, edit with loading/error states |
| **UX** | Debounced search, snackbar feedback (bottom-right), field-level validation errors |
| **Status buttons** | Rendered from `ticket.allowedNextStatuses` only — no hard-coded transitions |

### Documentation (root)

`README.md`, `candidate-info.md`, `requirements-analysis.md`, `acceptance-criteria.md`, `implementation-plan.md`, `design-notes.md`, `api-contract.md`, `test-strategy.md`, `debugging-notes.md`, `code-review-notes.md`, `reflection.md`, `pr-description.md`

---

## Database Changes

**Database:** `ticket_management` (PostgreSQL)

### New tables

| Table | Purpose |
|-------|---------|
| `users` | Seeded internal users (name, email, role) |
| `tickets` | Support tickets with priority, status, assignee, creator, timestamps |
| `comments` | Ticket comments (cascade delete on ticket removal) |

### Constraints & indexes
- `CHECK` on `tickets.priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `CHECK` on `tickets.status` (valid enum values; default `OPEN`)
- Foreign keys: `assigned_to`, `created_by` → `users`; `comments.ticket_id` → `tickets`
- Indexes: `idx_tickets_status`, `idx_tickets_assigned_to`, `idx_comments_ticket_id`

### Seed data (`data.sql`)
- 6 users (mixed roles)
- 4 sample tickets with comments
- Idempotent inserts (`ON CONFLICT` / `NOT EXISTS`)

**Migration approach:** `schema.sql` + `data.sql` run on startup via Spring SQL init (no Flyway/Liquibase).

---

## Testing Done

### Automated (backend)

| Suite | File | Count | Coverage |
|-------|------|-------|----------|
| Unit | `TicketStatusTransitionValidatorTest` | 3 | All allowed/disallowed transitions |
| Service | `TicketServiceTest` | 3 | Status update, not-found, invalid transition |
| Integration | `TicketStatusTransitionIntegrationTest` | 13 | HTTP → DB for transitions, validation, comments, users |
| Smoke | `TicketManagementApplicationTests` | 1 | Context loads |

**Run:** `cd backend && .\gradlew.bat test` (requires local PostgreSQL + `ticket_management` DB)

### Automated (frontend)

| Suite | Files | Count | Coverage |
|-------|-------|-------|----------|
| Pages | `TicketListPage`, `CreateTicketPage`, `TicketDetailPage`, `EditTicketPage` | 14 | List/search/filter, forms, status buttons from API, comments |
| Utils | `errorUtils`, `validationUtils`, `statusUtils`, `dateUtils` | 19 | Error parsing, validation, display helpers |
| Components | `AppSnackbar` | 2 | Toast display and dismiss |

**Run:** `cd frontend && npm test`

### Manual

- [x] Full ticket lifecycle in browser: create → `IN_PROGRESS` → `RESOLVED` → `CLOSED`
- [x] Cancellation from `OPEN` and `IN_PROGRESS`
- [x] Invalid transition rejected with snackbar error (API `400`)
- [x] Create/edit form validation (blank title)
- [x] Comment add and list on detail page
- [x] Search and status filter on list page
- [x] Swagger UI endpoint verification

### Not covered
- E2E browser tests with live backend (Playwright/Cypress)
- `PUT` update and list/search integration tests (documented gaps in `test-strategy.md`)

---

## AI Usage Summary

**Tool:** Cursor (primary AI assistant throughout the assessment)

| Activity | AI contribution | Human oversight |
|----------|-----------------|-----------------|
| Planning docs | Drafted requirements, acceptance criteria, implementation plan | Scope review, rejected out-of-scope items |
| Backend code | Entities, DTOs, controllers, validator, tests | Ran `./gradlew test`; fixed lazy-load and Mockito issues |
| Frontend code | Scaffold, pages, API modules, types | Verified `allowedNextStatuses` pattern; `npm run build` |
| Debugging | Diagnosed lazy initialization, backend-not-running, SQL init | Reproduced locally, validated fixes |
| Documentation | API contract, design notes, test strategy, review notes | Cross-checked against actual code |

**Key principle:** AI for boilerplate and first drafts; tests and manual E2E for business-rule correctness.

See `reflection.md` and `debugging-notes.md` for detailed AI interaction logs.

---

## Screenshots / Demo Notes

### How to run the demo

```powershell
# 1. Ensure PostgreSQL is running with database: ticket_management

# 2. Backend (Terminal 1)
cd backend
.\gradlew.bat bootRun
# API: http://localhost:8080/api
# Swagger: http://localhost:8080/swagger-ui.html

# 3. Frontend (Terminal 2)
cd frontend
npm install
npm run dev
# UI: http://localhost:5173
```

### Suggested demo flow

1. **List page** — show seeded tickets; search by keyword; filter by `OPEN`
2. **Create ticket** — pick assignee (support agent) and creator (employee); submit
3. **Detail page** — show status chips; click **Start Progress** (`IN_PROGRESS`)
4. **Comments** — add a comment as support agent
5. **Status progression** — `RESOLVED` → **Close** (`CLOSED`); confirm no further status buttons
6. **Invalid transition** — (optional) attempt skip via Swagger: `OPEN` → `CLOSED` returns `400`
7. **Edit** — update title/priority on an open ticket

### Screenshot placeholders

| Screen | Notes |
|--------|-------|
| Ticket list | Search bar, status filter, paginated table |
| Create ticket | Center-aligned form with user dropdowns |
| Ticket detail | Status action buttons, comment thread |
| Swagger UI | API explorer at `/swagger-ui.html` |

*(Add screenshots to `assets/` or PR attachments before submission.)*

---

## Known Limitations

| Limitation | Notes |
|------------|-------|
| **No authentication** | User selected from dropdown; no login or session |
| **No role-based access** | `UserRole` stored but not enforced |
| **No status audit trail** | Status changes are not historized |
| **No optimistic locking** | Concurrent edits are last-write-wins |
| **Local PostgreSQL required** | No Docker Compose; tests need live DB |
| **No E2E browser tests** | Component tests use mocked API; full browser flows verified manually |
| **Default DB password in config** | `application.yml` uses `Password` — override via env vars for real use |
| **Comments cannot be edited/deleted** | Create and list only |

---

## Future Improvements

| Priority | Improvement |
|----------|-------------|
| High | Testcontainers for CI-friendly integration tests |
| Medium | Playwright E2E tests against live backend |
| Medium | Spring Security + role-based transition permissions |
| Medium | Status change history (`ticket_status_events` table) |
| Medium | Integration tests for `PUT`, list/search, comment validation |
| Low | Email/Slack notifications on status change |
| Low | Docker Compose for one-command local setup |
| Low | React Query for API caching between pages |

---

## Reviewer checklist

- [ ] Backend starts and seed data loads (`bootRun`)
- [ ] `./gradlew.bat test` passes with PostgreSQL running
- [ ] `npm test` passes (frontend)
- [ ] Frontend connects to API (`npm run dev`)
- [ ] Status buttons match `allowedNextStatuses` from API
- [ ] Invalid transitions return `400` without DB change
- [ ] `README.md` setup steps work on a fresh machine
