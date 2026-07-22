# Review Fixes

Post-review changes applied to the Support Ticket Management System. Source: AI-assisted code review + manual testing (`code-review-notes.md`).

## Summary

| Category | Issues found | Fixed |
|----------|--------------|-------|
| Backend / JPA | 2 | 2 |
| Tests | 2 | 2 |
| Startup / SQL | 1 | 1 |
| Frontend UX | 5 | 5 |
| Documentation | 1 | 1 |

---

## Backend fixes

### 1. LazyInitializationException on ticket detail

**Problem:** `open-in-view: false` + lazy `@ManyToOne` on `Ticket.assignedTo` and `Ticket.createdBy` caused `500` errors when mapping to `TicketResponse`.

**Fix:** Added `TicketRepository.findByIdWithUsers` with `JOIN FETCH` for both user associations. `TicketService` uses it for all full ticket responses.

**Files:** `TicketRepository.java`, `TicketService.java`

**Rejected alternative:** Re-enabling `open-in-view: true` — masks the issue and holds DB sessions for the full request.

---

### 2. Repository fetch strategy for list vs detail

**Problem:** List search needed assignee data; detail needed both assignee and creator. Inconsistent fetch caused N+1 or lazy-load failures.

**Fix:** List uses `@EntityGraph(attributePaths = "assignedTo")`; detail uses explicit `JOIN FETCH` for both users.

**Files:** `TicketRepository.java`

---

## Test fixes

### 3. Mockito void-method stubbing

**Problem:** `when(validator.validate(...)).thenThrow(...)` is invalid for void methods — compile/runtime failure.

**Fix:** Changed to `doThrow(...).when(validator).validate(...)`.

**Files:** `TicketServiceTest.java`

---

### 4. Smoke test without PostgreSQL

**Problem:** `TicketManagementApplicationTests` context-load test failed when PostgreSQL was unavailable.

**Fix:** Excluded `DataSourceAutoConfiguration` and `HibernateJpaAutoConfiguration`; added `@MockBean` for repositories.

**Files:** `TicketManagementApplicationTests.java`

---

## Startup / database fixes

### 5. Empty SQL scripts blocked Spring init

**Problem:** Placeholder `schema.sql` and `data.sql` were empty; Spring SQL init rejected them on startup.

**Fix:** Added valid no-op SQL until full DDL/seed were implemented; later replaced with complete schema and seed data.

**Files:** `backend/src/main/resources/schema.sql`, `backend/src/main/resources/data.sql`

---

## Frontend UX fixes

### 6. Create/edit forms left-aligned

**Change:** Wrapped pages in centered flex column; `maxWidth: 640` on form card.

**Files:** `CreateTicketPage.tsx`, `EditTicketPage.tsx`

---

### 7. No way back from detail page

**Change:** Added **Back** button linking to `/`.

**Files:** `TicketDetailPage.tsx`

---

### 8. Duplicate "New Ticket" button

**Change:** Removed page-level button on list page; kept nav bar link only.

**Files:** `TicketListPage.tsx`

---

### 9. Redundant Refresh button

**Change:** Removed Refresh; list auto-updates on debounced search, filter, and page change.

**Files:** `TicketListPage.tsx`

---

### 10. Toast position

**Change:** Moved snackbar from bottom-center to bottom-right.

**Files:** `AppSnackbar.tsx`

---

## Documentation fixes

### 11. "Unable to reach server" operational confusion

**Change:** Documented two-terminal startup (backend on 8080, frontend on 5173) in README. No code change — operational issue, not a bug.

**Files:** `README.md`

---

## Suggestions reviewed but not implemented

| Suggestion | Reason deferred |
|------------|-----------------|
| Spring Security / JWT | Out of assignment scope |
| Docker Compose for PostgreSQL | Out of scope; local PostgreSQL documented |
| MapStruct for mappers | Unnecessary dependency for small mappers |
| React Query / TanStack Query | No frontend test suite; simple fetch patterns suffice |
| Status change audit table | Not in acceptance criteria |
| Testcontainers | Valid follow-up; deferred to align with local-PostgreSQL README |
| Block edits on CLOSED/CANCELLED | Not specified; logged as open question |

---

## Verification after fixes

| Check | Result |
|-------|--------|
| `GET /api/tickets/{id}` returns user names | Pass |
| `./gradlew test` with PostgreSQL | Pass (20 tests) |
| Backend starts with schema + seed | Pass |
| Frontend E2E: list → detail → status → comment | Pass |
| `npm run build` | Pass |

---

## Remaining gaps (not fixed in review pass)

Documented for follow-up — not blockers for assignment submission:

- No frontend automated tests
- Integration tests require live PostgreSQL (no Testcontainers)
- `UserRole` not enforced in API
- No optimistic locking on concurrent updates
- Gaps in integration coverage for `PUT` and list/search endpoints

See `test-strategy.md` and `code-review-notes.md` for details.
