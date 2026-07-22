# Reflection

## What I Built

A full-stack **Support Ticket Management System** for internal support workflows:

- **Backend:** Spring Boot 3.3 REST API (Java 21, Gradle, PostgreSQL) with ticket CRUD, comment management, user listing, Bean Validation, and a server-enforced status state machine (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`, with cancellation from `OPEN` or `IN_PROGRESS`).
- **Frontend:** React 19 + TypeScript + Vite + MUI SPA with list/search/filter, create, detail (dynamic status buttons from `allowedNextStatuses`), edit, and comment threads.
- **Tests:** 20 backend tests (unit, service, integration) + 35 frontend Vitest tests — focused on the status machine and UI behavior with mocked API.
- **Documentation:** README, requirements analysis, acceptance criteria, implementation plan, design notes, API contract, test strategy, debugging notes, code review notes, and this reflection.

The guiding principle throughout: **the backend owns business rules; the frontend is a thin client.**

---

## How I Used AI (across the lifecycle)

| Phase | How Cursor was used | My role |
|-------|---------------------|---------|
| **Planning** | Drafted `requirements-analysis.md`, `acceptance-criteria.md`, `implementation-plan.md` from the assignment brief | Reviewed scope, confirmed status workflow, rejected out-of-scope items (auth, Docker) |
| **Backend scaffold** | Generated Gradle project, entities, repositories, `schema.sql`, `data.sql` | Verified package structure, enum values, and FK constraints |
| **API layer** | Generated DTOs, controllers, mappers, `GlobalExceptionHandler`, OpenAPI config | Checked endpoint split (`PUT` vs `PATCH /status`), validated error shapes |
| **Business logic** | Generated `TicketStatusTransitionValidator` and service layer | Confirmed transition matrix matches requirements; ran tests |
| **Testing** | Scaffolded unit, service, and integration tests | Fixed Mockito void-stubbing issue; verified DB assertions on rejected transitions |
| **Frontend** | Scaffolded Vite app, API modules, types, and all four pages | Reviewed that status buttons use `allowedNextStatuses`; ran `npm run build` |
| **Debugging** | Diagnosed lazy-load errors, backend-not-running, PostgreSQL auth, empty SQL scripts | Reproduced issues locally, applied fixes, re-tested |
| **Documentation** | Generated design notes, API contract, test strategy, debugging/code-review notes | Verified accuracy against actual code; filled candidate-specific details |
| **UX polish** | Center-aligned forms, Back button, removed duplicate buttons, toast position | Directed specific UI changes from manual testing |

**Pattern:** AI for first drafts and boilerplate; human for business-rule verification, running tests, and manual E2E checks.

---

## What AI Helped With Most

1. **Boilerplate velocity.** Entities, DTOs, controllers, mappers, and React page scaffolding came together quickly — letting me focus on the status state machine and test coverage instead of repetitive setup.
2. **Test scaffolding.** Integration tests for every valid and invalid transition, with DB state assertions, were generated efficiently and became the safety net for the core requirement.
3. **Documentation drafts.** Turning the codebase into `api-contract.md`, `design-notes.md`, and `test-strategy.md saved significant time while keeping docs aligned with implementation.
4. **Debugging acceleration.** When I hit `LazyInitializationException` or "Unable to reach server," AI quickly narrowed the cause (fetch strategy vs. stopped backend) and suggested targeted fixes.
5. **Consistent patterns.** Error handling (`GlobalExceptionHandler` + `errorUtils`), CORS config, and repository query patterns were applied uniformly across the project.

---

## What AI Got Wrong

| Issue | What happened | How I caught it |
|-------|---------------|-----------------|
| **Lazy loading with `open-in-view: false`** | Initial detail endpoint used `findById()` without fetching `User` associations | `500` + `LazyInitializationException` in Swagger; fixed with `JOIN FETCH` |
| **Mockito void stubbing** | `when(validator.validate(...)).thenThrow(...)` — invalid for void methods | Compile/test failure; switched to `doThrow().when(...)` |
| **Smoke test without DB** | Context-load test tried to wire real JPA against missing PostgreSQL | `./gradlew build` failed in CI-like environment; excluded DataSource autoconfig |
| **Empty SQL scripts** | Placeholder `schema.sql` / `data.sql` caused Spring init failure | Backend startup error; added valid no-op SQL until real DDL was ready |
| **Assumed backend was running** | When frontend showed "Unable to reach server," AI correctly identified it but the root cause was operational (forgot to start `bootRun`), not a code bug | Manual port check on 8080 |
| **Occasional over-scoping** | Suggestions for auth, Docker Compose, MapStruct, React Query | Rejected — not in assignment scope; documented as out-of-scope or follow-up |

**Lesson:** AI is strong at generating structure but can miss runtime interactions (JPA fetch boundaries, Mockito APIs, Spring init ordering). Always run the app and tests after accepting AI-generated changes.

---

## How I Validated AI Output

| Check | What I did |
|-------|------------|
| **Compile & build** | `.\gradlew.bat build` (backend), `npm run build` (frontend) after every major change |
| **Unit tests** | `./gradlew test` — especially `TicketStatusTransitionValidatorTest` and `TicketServiceTest` |
| **Integration tests** | Full transition matrix: valid paths succeed + persist; invalid paths return `400` + DB unchanged |
| **Manual API testing** | Swagger UI (`/swagger-ui.html`) for create, update, status patch, comments |
| **Manual E2E** | Browser workflow: create ticket → transition through lifecycle → add comment → close; verify only valid status buttons appear |
| **Error paths** | Blank title on create, invalid transition (e.g. `OPEN` → `CLOSED`), backend stopped (network error message) |
| **Doc accuracy** | Cross-checked `api-contract.md` and `acceptance-criteria.md` against actual controllers and DTOs |
| **Code review pass** | Used AI-assisted review + my own read-through; logged findings in `code-review-notes.md` |

I did **not** accept AI output without running at least one of: build, test suite, or manual smoke test.

---

## What I Would Improve Next

| Priority | Improvement | Why |
|----------|-------------|-----|
| **High** | Testcontainers for integration tests | Remove dependency on manually running local PostgreSQL; enable CI |
| **Medium** | Integration tests for `PUT`, list/search, comment validation | Close gaps documented in `test-strategy.md` |
| **Medium** | Role-based authorization | `UserRole` exists but is unused — needs PO decision on who can transition status |
| **Medium** | Environment-based config | Move DB password out of `application.yml`; use `.env` / secrets for local dev |
| **Low** | Status change audit trail | Track who changed status and when |
| **Low** | Optimistic locking (`@Version`) | Prevent silent overwrites on concurrent edits |
| **Low** | React Query for API caching | Reduce refetching when navigating between list and detail |

If I had more time on this assignment, I would spend it on **Testcontainers + E2E browser tests** — the two biggest quality gaps for a production-bound app.

---

## Reusable Workflow (prompts, rules, specs, templates)

### Workflow I would repeat

```
1. Requirements doc     →  requirements-analysis.md
2. Acceptance criteria  →  acceptance-criteria.md (checkboxes)
3. Implementation plan  →  phased breakdown + milestones
4. Backend-first build  →  schema → entities → validator → API → tests
5. Frontend against API →  types mirror DTOs; no business logic in UI
6. Debug log            →  debugging-notes.md (problem → investigate → fix)
7. Code review          →  code-review-notes.md (accepted vs rejected suggestions)
8. Reflection           →  this file
```

### Prompt patterns that worked well

| Prompt style | Example | Why it worked |
|--------------|---------|---------------|
| **Template + fill** | "Create `requirements-analysis.md` with sections: …" | Clear structure; AI fills from codebase context |
| **Scoped implementation** | "Implement frontend-pages todo only — list, detail, create, edit" | Avoids scope creep in a single session |
| **Debug with symptom** | "Getting 'unable to reach server' on API call — check if backend is running" | Symptom-led; AI checks infra before changing code |
| **Small UX directive** | "Make create ticket page center aligned" | Precise, one change, easy to verify |
| **Doc from code** | "Create `api-contract.md` from backend controllers and DTOs" | Grounded in source of truth, not memory |

### Rules I followed (and would keep)

- **Backend owns business rules** — never hard-code status transitions in the frontend.
- **Run tests after AI changes** — especially for service/validator logic.
- **Reject out-of-scope suggestions** — auth, Docker, audit trail unless explicitly required.
- **Document assumptions** — log open questions for a product owner rather than guessing.
- **Separate update from status change** — `PUT` for metadata, `PATCH /status` for the state machine.
- **Minimal dependencies** — no MapStruct, React Query, or Testcontainers unless justified.

### Templates created (reusable across projects)

| File | Purpose |
|------|---------|
| `candidate-info.md` | Metadata: name, stack, dates, project option |
| `requirements-analysis.md` | Understanding, FR/NFR, assumptions, edge cases |
| `acceptance-criteria.md` | Verifiable done conditions with checkboxes |
| `implementation-plan.md` | Phases, milestones, AI usage plan, risks |
| `design-notes.md` | Architecture, layer design, validation/error strategy |
| `api-contract.md` | Per-endpoint request/response/validation/errors |
| `test-strategy.md` | Scope, pyramid, gaps |
| `debugging-notes.md` | Issue template: problem → investigate → AI help → validate → fix |
| `code-review-notes.md` | AI summary, observations, changes, rejected suggestions |
| `reflection.md` | Lifecycle retrospective |

### One-line takeaway

> Use AI to go fast on structure and docs; use tests and manual E2E to stay correct on business rules.
