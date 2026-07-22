# Code Review Notes

## AI-Assisted Review Summary

Cursor was used to review the codebase against assignment requirements, `acceptance-criteria.md`, and common Spring/React pitfalls. Key findings from AI-assisted review:

| Area | AI finding | Severity |
|------|------------|----------|
| **Status machine** | Transitions centralized in `TicketStatusTransitionValidator` — good; frontend uses `allowedNextStatuses` from API | ✅ Pass |
| **Lazy loading** | `open-in-view: false` + lazy `@ManyToOne` on `Ticket` risked `LazyInitializationException` on detail endpoints | 🔴 High — fixed |
| **Separation of concerns** | `PUT` updates metadata; `PATCH /status` handles transitions — correct split | ✅ Pass |
| **Error handling** | Consistent `GlobalExceptionHandler` + frontend `errorUtils` parsing | ✅ Pass |
| **Test coverage** | Strong on status transitions; gaps on list/search PUT and frontend | 🟡 Medium — documented in `test-strategy.md` |
| **Security** | No auth; default DB password in `application.yml` | 🟡 Expected for scope |
| **Frontend duplication** | Duplicate "New Ticket" button (nav + list page); manual Refresh redundant with debounced search | 🟢 Low — UX cleanup |
| **Repository queries** | List search uses `@EntityGraph` for assignee; detail needs explicit `JOIN FETCH` for both users | 🔴 High — fixed |

Overall: architecture and core business rules are sound. Main risks were JPA fetch strategy and operational setup (backend must be running for frontend).

---

## My Review Observations

### Backend — strengths

- **Single source of truth for status rules.** `TicketStatusTransitionValidator` owns the transition map; controllers attach `allowedNextStatuses` to every `TicketResponse`. Easy to test and extend.
- **Clean layering.** Controllers are thin; services hold orchestration; DTOs decouple API from JPA entities. Manual mappers (`TicketMapper`, `UserMapper`) are simple and readable for a project this size.
- **Sensible JPA config.** `ddl-auto: validate` + explicit `schema.sql` keeps schema in version control. `open-in-view: false` avoids holding DB connections for the full request lifecycle.
- **Defensive status updates.** `updateStatus` validates before `setStatus()` and `save()` — invalid transitions never persist.
- **Good error contract.** `ValidationErrorResponse` with field-level errors; `InvalidStatusTransitionException` returns a clear message naming `from` and `to` statuses.

### Backend — areas to watch

- **`findTicketOrThrow` vs `findByIdWithUsers`.** Status updates use the lighter `findById` (no user fetch needed for the write itself), then re-fetch with users for the response — correct pattern but easy to regress if someone maps the entity directly after `findById`.
- **No optimistic locking.** Concurrent updates are last-write-wins; acceptable for assignment scope but worth documenting.
- **Integration tests depend on live PostgreSQL.** No Testcontainers — tests can fail if DB is down or seed data is missing.
- **User roles unused.** `UserRole` exists in the model but is not enforced anywhere.

### Frontend — strengths

- **API-driven status buttons.** `TicketDetailPage` renders actions from `ticket.allowedNextStatuses` only — no duplicated state machine logic.
- **Consistent error UX.** Shared `AppSnackbar`, `getErrorMessage`, and `getFieldErrors` across all pages.
- **Debounced search.** `useDebounce` on the list page avoids hammering the API on every keystroke.
- **Parallel data loading.** Detail page uses `Promise.all` for ticket, comments, and users.

### Frontend — areas to watch

- **No automated tests.** All UI verification is manual; regressions in form handling or status buttons would not be caught in CI.
- **Page-level state only.** No shared cache — navigating back to the list always refetches. Fine for this size app.
- **`showSnackbar` in `useCallback` deps.** Can cause unnecessary re-fetches if the snackbar hook identity changes; minor, not causing bugs today.
- **Comment list optimistic prepend.** New comment is prepended locally on success; assumes server order matches (newest first) — matches backend behavior.

---

## Changes Made After Review

| # | Trigger | Change | File(s) |
|---|---------|--------|---------|
| 1 | `LazyInitializationException` on `GET /api/tickets/{id}` | Added `findByIdWithUsers` with `JOIN FETCH` for `assignedTo` and `createdBy`; service uses it for all full responses | `TicketRepository.java`, `TicketService.java` |
| 2 | AI + manual review: keep `open-in-view: false` | Did not re-enable OSIV; fixed fetch at repository layer instead | `application.yml` |
| 3 | Mockito compile/runtime failure | Changed void-method stubbing to `doThrow().when(validator).validate(...)` | `TicketServiceTest.java` |
| 4 | Smoke test failed without PostgreSQL | Excluded `DataSourceAutoConfiguration` and `HibernateJpaAutoConfiguration`; `@MockBean` repositories | `TicketManagementApplicationTests.java` |
| 5 | Empty SQL scripts blocked startup | Added valid no-op SQL until full schema/seed were implemented | `schema.sql`, `data.sql` |
| 6 | UX: create/edit forms left-aligned | Wrapped pages in centered flex column; `maxWidth: 640` on form card | `CreateTicketPage.tsx`, `EditTicketPage.tsx` |
| 7 | UX: no way back from detail page | Added **Back** button linking to `/` | `TicketDetailPage.tsx` |
| 8 | UX: duplicate "New Ticket" entry point | Removed page-level button; kept nav bar link only | `TicketListPage.tsx` |
| 9 | UX: redundant Refresh button | Removed; list auto-updates on search/filter/page change | `TicketListPage.tsx` |
| 10 | UX: toast position | Moved snackbar from bottom-center to bottom-right | `AppSnackbar.tsx` |
| 11 | Operational: "Unable to reach server" | Documented two-terminal startup in README; no code change | `README.md` |

---

## Suggestions Rejected (and why)

| Suggestion | Source | Why rejected |
|------------|--------|--------------|
| **Re-enable `open-in-view: true`** | Quick fix for lazy-load errors | Masks the problem; keeps DB sessions open for entire request. Explicit `JOIN FETCH` is the correct fix and was applied instead. |
| **Hard-code status transition buttons in the frontend** | Faster UI iteration | Violates core requirement: backend owns business rules. Frontend must use `allowedNextStatuses` from the API. |
| **Add Spring Security / JWT auth** | Production readiness | Explicitly out of scope per assignment and README. Would add significant complexity without meeting current acceptance criteria. |
| **Add Docker Compose for PostgreSQL** | Easier onboarding | Out of scope; assignment assumes local PostgreSQL. Documented setup in README instead. |
| **Introduce MapStruct for mappers** | Less boilerplate | Manual static mappers are ~15 lines each; adding MapStruct is a new dependency and build plugin for minimal gain at this scale. |
| **Add React Query / TanStack Query** | Cache API responses, reduce refetching | No frontend test suite to protect against regressions; added dependency not justified for four pages with simple fetch-on-mount patterns. |
| **Add status change audit/history table** | Traceability | Out of scope; would require new entity, API, and UI without being in acceptance criteria. |
| **Keep the Refresh button on the list page** | Explicit user control | Debounced search + filter + pagination already trigger refetch; button was redundant and removed per UX feedback. |
| **Keep duplicate "New Ticket" on list page** | Discoverability | Nav bar already provides the action; duplicate button cluttered the home page and was removed per UX feedback. |
| **Use Testcontainers for integration tests** | Tests runnable without local PostgreSQL | Valid improvement but adds Docker dependency and CI setup; deferred to keep test config aligned with README's local-PostgreSQL assumption. |
| **Block ticket edits on terminal statuses (`CLOSED`, `CANCELLED`)** | Stricter business rules | Not specified in requirements; current behavior allows metadata edits on any status. Logged as a clarification question in `requirements-analysis.md` instead of implementing without PO input. |

---

## Review conclusion

The codebase meets the assignment's core goals: enforced status workflow on the backend, thin frontend client, REST API with validation and error handling, and integration tests for the state machine. Post-review changes focused on **JPA fetch correctness**, **test reliability**, and **UX polish** rather than architectural rewrites — appropriate for the scope and timeline.

**Recommended follow-ups (post-submission):** Testcontainers for CI, frontend component tests for `TicketDetailPage` status buttons, integration tests for `PUT` and list/search endpoints, and role-based authorization if the product owner confirms requirements.
