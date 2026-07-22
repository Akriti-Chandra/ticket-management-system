# Test Strategy

## Test Scope

Testing focuses on the **backend**, where all business rules (especially the ticket status state machine) are enforced. The **frontend** has Vitest + React Testing Library coverage for pages, utilities, and shared components; manual end-to-end smoke testing supplements automated UI tests.

| Area | In scope | Out of scope |
|------|----------|--------------|
| Status transition state machine | Yes | — |
| Ticket CRUD via REST API | Partial (create validation, status patch) | Full PUT update, list/search pagination |
| Comment creation & user listing | Yes (integration) | Comment list ordering, comment validation errors |
| Request validation (`@Valid`) | Partial (blank title on create) | All field-level rules per endpoint |
| Error responses (400, 404, 500) | Partial (400 transitions, 404 in service unit test) | 500 generic handler |
| Frontend UI / routing | Vitest + RTL (pages, utils, snackbar) | E2E (Playwright/Cypress) |
| Authentication / authorization | — | No auth in current scope |
| Performance / load testing | — | Not required for assignment |

**Test pyramid:**

```
        ┌─────────────┐
        │  Frontend   │  Vitest + RTL (9 files, 35 tests)
        ├─────────────┤
        │ Integration │  TicketStatusTransitionIntegrationTest (13 tests)
        ├─────────────┤
        │   Service   │  TicketServiceTest (3 tests)
        ├─────────────┤
        │    Unit     │  TicketStatusTransitionValidatorTest (3 tests)
        ├─────────────┤
        │   Smoke     │  TicketManagementApplicationTests (context loads)
        └─────────────┘
```

**How to run:**

```powershell
# Backend (requires PostgreSQL + ticket_management database)
cd backend
.\gradlew.bat test

# Frontend
cd frontend
npm test
```

Backend integration tests require PostgreSQL running locally with the `ticket_management` database (see `application-test.yml`).

**Traceability:** Tests map to `acceptance-criteria.md` (Core, Validation, Error Handling, Testing sections).

---

## Unit Tests

Isolated tests with no Spring context or database. Fast to run; target pure logic.

### `TicketStatusTransitionValidatorTest`

| Test | What it verifies |
|------|------------------|
| `allowsValidTransitions` | All five allowed transitions pass without exception |
| `rejectsInvalidTransitions` | Skipped steps, backward moves, and terminal-state moves throw `InvalidStatusTransitionException` with correct message |
| `returnsAllowedNextStatuses` | `getAllowedNextStatuses()` returns correct set per status; empty for `CLOSED` and `CANCELLED` |

**Why unit level:** The transition map is the most critical business rule. Testing it in isolation ensures every path is covered without HTTP or DB overhead.

### `TicketServiceTest` (mocked dependencies)

Uses `@ExtendWith(MockitoExtension.class)` with mocked `TicketRepository`, `UserRepository`, and `TicketStatusTransitionValidator`.

| Test | What it verifies |
|------|------------------|
| `updateStatus_validatesTransitionAndPersists` | Validator is called with correct from/to; ticket is saved; status updated |
| `updateStatus_throwsWhenTicketNotFound` | `ResourceNotFoundException` when ticket missing; validator and save never called |
| `updateStatus_propagatesInvalidTransition` | Invalid transition throws; ticket status unchanged; save never called |

**Why unit level:** Confirms service orchestration (validate → mutate → save) without hitting a real database.

---

## Component Tests

**Status: Implemented** (Vitest + React Testing Library + jsdom).

**Run:** `cd frontend && npm test`

| File | What it verifies |
|------|------------------|
| `TicketListPage.test.tsx` | Renders tickets, debounced search, status filter |
| `CreateTicketPage.test.tsx` | Form render, client validation, successful submit |
| `TicketDetailPage.test.tsx` | Detail render, status buttons from `allowedNextStatuses`, status update, comment validation/submit |
| `EditTicketPage.test.tsx` | Pre-filled form, validation, update submit |
| `AppSnackbar.test.tsx` | Message display and dismiss |
| `errorUtils.test.ts` | `getErrorMessage`, `getFieldErrors` |
| `validationUtils.test.ts` | Create/update ticket and comment validation |
| `statusUtils.test.ts` | Label and chip color helpers |
| `dateUtils.test.ts` | Timestamp formatting |

**Manual coverage still recommended:**

| Scenario | Manual check |
|----------|--------------|
| Full ticket lifecycle in browser | Create → transition → comment → close |
| Backend not running | Network error snackbar |
| API validation errors (400) | Inline field errors from server |

**Not covered by automated frontend tests:** E2E browser flows (Playwright/Cypress), cross-page navigation with a live backend, and visual/regression testing.

---

## API / Integration Tests

Full-stack tests using `@SpringBootTest` + `MockMvc` + real PostgreSQL (`@ActiveProfiles("test")`).

**File:** `TicketStatusTransitionIntegrationTest`

### Happy-path status transitions

| Test | HTTP | Asserts |
|------|------|---------|
| `openToInProgress_succeeds` | `PATCH /api/tickets/{id}/status` | Response + DB = `IN_PROGRESS` |
| `inProgressToResolved_succeeds` | same | Response + DB = `RESOLVED` |
| `resolvedToClosed_succeeds` | same | Response + DB = `CLOSED` |
| `openToCancelled_succeeds` | same | Response + DB = `CANCELLED` |
| `inProgressToCancelled_succeeds` | same | Response + DB = `CANCELLED` |

### API validation & ancillary endpoints

| Test | HTTP | Asserts |
|------|------|---------|
| `createTicket_blankTitle_returnsValidationErrors` | `POST /api/tickets` | `400` + field error on `title` |
| `createComment_succeeds` | `POST /api/tickets/{id}/comments` | `201` + comment message in response |
| `listUsers_returnsSeededUsers` | `GET /api/users` | `200` + ≥ 5 seeded users |

### Application smoke

| Test | What it verifies |
|------|------------------|
| `TicketManagementApplicationTests.contextLoads` | Spring context starts (repositories mocked; no DB required) |

**Test data strategy:** Integration tests use seeded users (`carol.davis@example.com`, `alice.johnson@example.com`) and create tickets with unique UUID titles in `@BeforeEach` / per test to avoid collisions.

---

## Edge Case Tests

Covered primarily in integration tests (rejected transitions) and unit tests (validator edge cases).

### Invalid status transitions (integration — DB must not change)

| Test | Transition | Expected |
|------|------------|----------|
| `openToClosed_rejectedWithMessageAndDbUnchanged` | `OPEN` → `CLOSED` | `400`, message contains both statuses, DB still `OPEN` |
| `openToResolved_rejectedWithMessageAndDbUnchanged` | `OPEN` → `RESOLVED` | `400`, DB unchanged |
| `resolvedToOpen_rejectedWithMessageAndDbUnchanged` | `RESOLVED` → `OPEN` | `400`, DB unchanged |
| `cancelledToOpen_rejectedWithMessageAndDbUnchanged` | `CANCELLED` → `OPEN` | `400`, DB unchanged |
| `closedToInProgress_rejectedWithMessageAndDbUnchanged` | `CLOSED` → `IN_PROGRESS` | `400`, DB unchanged |

### Validator unit edge cases

| Scenario | Covered |
|----------|---------|
| Terminal states (`CLOSED`, `CANCELLED`) return empty `allowedNextStatuses` | Yes |
| Skip-step transitions (`OPEN` → `RESOLVED`, `OPEN` → `CLOSED`) | Yes |
| Backward transitions (`RESOLVED` → `OPEN`, `CANCELLED` → `OPEN`) | Yes |
| Re-entry from terminal (`CLOSED` → `IN_PROGRESS`) | Yes |

### Service edge cases

| Scenario | Covered |
|----------|---------|
| Status update on non-existent ticket | Yes (`TicketServiceTest`) |
| Invalid transition does not call `save()` | Yes (unit + integration) |

---

## Tests Not Covered (and why)

| Gap | Why not covered | Risk | Suggested follow-up |
|-----|-----------------|------|---------------------|
| **Frontend E2E tests** | Vitest + RTL cover component behavior with mocked API | Cross-page flows with live backend | Add Playwright for full browser E2E |
| **`PUT /api/tickets/{id}` update** | Core focus was status machine, not full CRUD | Update endpoint could break silently | Integration test for happy path + 404 assignee |
| **`GET /api/tickets` list/search** | Search/pagination deemed lower risk than transitions | Filter/pagination bugs | MockMvc tests with keyword + status + page params |
| **`GET /api/tickets/{id}`** | Covered indirectly via status patch responses | Detail endpoint-specific bugs | Dedicated GET test asserting `allowedNextStatuses` |
| **Comment list (`GET .../comments`)** | Only POST tested | Ordering/filter bugs | Test newest-first order via integration test |
| **Comment validation errors** | Only ticket create validation tested | Blank comment not caught in CI | POST comment with blank `message` → `400` |
| **404 for missing ticket on comment/list** | Not prioritized | Wrong error shape | GET/POST comments with invalid `ticketId` |
| **404 for missing user on create** | Service logic mirrors tested patterns | Wrong assignee ID on create | POST ticket with invalid `assignedToId` |
| **All `@Valid` field rules** | One representative case (blank title) chosen | Other fields could fail validation | Parameterized tests per DTO |
| **Same-status transition** | Not explicitly tested | Ambiguous behavior if attempted | Add test: `OPEN` → `OPEN` should `400` |
| **`CommentService` / `UserService` unit tests** | Thin services; covered by integration where needed | Low for current scope | Mockito tests if services grow |
| **Concurrent status updates** | Out of scope; no optimistic locking | Last-write-wins race | Document as known limitation |
| **Performance / load** | Not required for assignment | Unknown scale limits | JMeter/k6 if production-bound |
| **Security (auth, RBAC)** | Explicitly out of scope per README | Anyone can act as any user | Add when auth is in scope |
| **CORS / OpenAPI** | Infrastructure config; manual browser check | Dev-only misconfiguration | Optional contract test via OpenAPI spec |

---

## Summary

| Layer | Files | Test count | Role |
|-------|-------|------------|------|
| Unit | `TicketStatusTransitionValidatorTest`, `TicketServiceTest` | 6 | Fast feedback on business rules and service orchestration |
| Integration | `TicketStatusTransitionIntegrationTest` | 13 | End-to-end HTTP → service → DB for transitions and key APIs |
| Smoke | `TicketManagementApplicationTests` | 1 | Context wiring |
| Frontend | 9 Vitest files (pages, utils, components) | 35 | UI behavior with mocked API; status buttons from `allowedNextStatuses` |

The strategy prioritizes **correctness of the status state machine** — the highest-risk, most business-critical part of the application — with defense in depth across unit, service, integration, and frontend component layers.
