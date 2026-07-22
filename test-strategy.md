# Test Strategy

## Test Scope

Testing focuses on the **backend**, where all business rules (especially the ticket status state machine) are enforced. The frontend is validated through manual end-to-end smoke testing rather than automated tests.

| Area | In scope | Out of scope |
|------|----------|--------------|
| Status transition state machine | Yes | — |
| Ticket CRUD via REST API | Partial (create validation, status patch) | Full PUT update, list/search pagination |
| Comment creation & user listing | Yes (integration) | Comment list ordering, comment validation errors |
| Request validation (`@Valid`) | Partial (blank title on create) | All field-level rules per endpoint |
| Error responses (400, 404, 500) | Partial (400 transitions, 404 in service unit test) | 500 generic handler |
| Frontend UI / routing | Manual only | Automated component/E2E tests |
| Authentication / authorization | — | No auth in current scope |
| Performance / load testing | — | Not required for assignment |

**Test pyramid:**

```
        ┌─────────────┐
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
cd backend
.\gradlew.bat test
```

Requires PostgreSQL running locally with the `ticket_management` database (see `application-test.yml`).

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

**Status: Not implemented.**

The frontend has no automated component tests (no Vitest, React Testing Library, or Cypress/Playwright in `package.json`).

**Planned manual coverage instead:**

| Component / page | Manual check |
|------------------|--------------|
| `TicketListPage` | Search, status filter, pagination, navigation to detail |
| `CreateTicketPage` | Form submit, validation errors from API, user dropdowns |
| `TicketDetailPage` | Status buttons from `allowedNextStatuses`, comment add/list |
| `EditTicketPage` | Update fields without status change |
| `errorUtils` / `useSnackbar` | API errors surfaced to user |

**Why not automated:** Assignment scope prioritizes backend correctness and the status state machine. Frontend is a thin API client; manual smoke testing is sufficient for the current deliverable. Component tests would be a natural follow-up (Vitest + React Testing Library).

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
| **Frontend automated tests** | Thin client; manual E2E sufficient for assignment scope | UI regressions (wrong buttons, broken forms) | Add Vitest + RTL for pages; Playwright for E2E |
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
| Frontend | — | 0 | Manual smoke test before submission |

The strategy prioritizes **correctness of the status state machine** — the highest-risk, most business-critical part of the application — with defense in depth across unit, service, and integration layers.
