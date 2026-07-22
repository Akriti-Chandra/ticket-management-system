# Implementation Plan

## Overview

Build a full-stack **Support Ticket Management System** with a Spring Boot REST API (backend) and a React + TypeScript UI (frontend). The backend owns all business rules — especially the ticket status state machine — while the frontend consumes the API and renders only allowed actions.

**Approach:** Backend-first. Define the data model, status transition rules, and API contracts before building UI pages. Add integration tests around the state machine early, then wire up the frontend against stable endpoints.

**Tech stack:** Java 21, Spring Boot 3.3, Gradle, PostgreSQL, React 19, TypeScript, Vite, MUI, Axios.

**Estimated duration:** ~6 days (July 13 – July 19, 2026).

## Task Breakdown

### Phase 1 — Analysis & design
- [ ] Review assignment requirements and select project option.
- [ ] Write `requirements-analysis.md` (functional/non-functional requirements, assumptions, edge cases).
- [ ] Write `acceptance-criteria.md` with verifiable done conditions.
- [ ] Define status transition matrix and API endpoint list.

### Phase 2 — Backend foundation
- [ ] Scaffold Spring Boot project (Gradle, Java 21).
- [ ] Create PostgreSQL schema (`users`, `tickets`, `comments`) with constraints and indexes.
- [ ] Add seed data (`data.sql`) for users, sample tickets, and comments.
- [ ] Implement JPA entities and repositories.
- [ ] Configure `application.yml` (datasource, SQL init) and CORS for `localhost:5173`.

### Phase 3 — Backend business logic & API
- [ ] Implement `TicketStatusTransitionValidator` with allowed-transition map.
- [ ] Implement `TicketService` (create, search, update, updateStatus).
- [ ] Implement `CommentService` and `UserService`.
- [ ] Build REST controllers: tickets, comments, users.
- [ ] Add DTOs, mappers, and request validation (`@Valid`).
- [ ] Add `GlobalExceptionHandler` (validation, not-found, invalid transition, generic 500).
- [ ] Configure OpenAPI/Swagger.

### Phase 4 — Backend testing
- [ ] Unit tests for `TicketStatusTransitionValidator`.
- [ ] Service tests for `TicketService` (mocked repositories).
- [ ] Integration tests for all valid and invalid status transitions.
- [ ] Integration tests for validation errors, comment creation, and user listing.

### Phase 5 — Frontend foundation
- [ ] Scaffold Vite + React + TypeScript project with MUI.
- [ ] Set up routing (`/`, `/tickets/new`, `/tickets/:id`, `/tickets/:id/edit`).
- [ ] Create Axios client with configurable `VITE_API_BASE_URL`.
- [ ] Define shared TypeScript types matching API responses.

### Phase 6 — Frontend features
- [ ] **Ticket list page** — table, keyword search (debounced), status filter, pagination.
- [ ] **Create ticket page** — form with user dropdowns for assignee/creator.
- [ ] **Ticket detail page** — metadata, status chip, dynamic status buttons from `allowedNextStatuses`, comment list and add form.
- [ ] **Edit ticket page** — update title, description, priority, assignee (not status).
- [ ] Shared utilities: status labels/colors, date formatting, error/snackbar handling.

### Phase 7 — Documentation & submission
- [ ] Write `README.md` (setup, env vars, endpoints, run instructions).
- [ ] Complete `candidate-info.md`, `implementation-plan.md`, `ai-usage-log.md`.
- [ ] Manual end-to-end smoke test (create → transition → comment → close).
- [ ] Final review against `acceptance-criteria.md`.

## Milestones

| # | Milestone | Target | Done when |
|---|-----------|--------|-----------|
| M1 | Requirements complete | Day 1 (Jul 13) | Analysis docs written; status workflow and API contract agreed |
| M2 | Backend API running | Day 2 (Jul 14) | Schema + seed data load; all endpoints return correct responses via Swagger |
| M3 | Status machine verified | Day 3 (Jul 15) | All transition integration tests pass; invalid transitions rejected |
| M4 | Frontend core pages | Day 4–5 (Jul 16–17) | List, create, detail, and edit pages wired to API |
| M5 | End-to-end workflow | Day 6 (Jul 18) | Full ticket lifecycle works in browser; errors surfaced in UI |
| M6 | Submission ready | Day 7 (Jul 19) | README and assignment docs complete; acceptance criteria met |

## AI Usage Plan

**Tool:** Cursor (primary AI assistant for the assessment).

| Activity | How AI is used | Human responsibility |
|----------|----------------|----------------------|
| Requirements & planning | Draft analysis docs and acceptance criteria from assignment brief | Review, refine assumptions, approve scope |
| Backend scaffolding | Generate entity/DTO/controller boilerplate from schema design | Verify package structure, naming, and business rules |
| Status validator & tests | Generate transition map and test cases from requirements matrix | Confirm every edge case is covered; run tests locally |
| Frontend pages | Scaffold MUI forms/tables and API hooks from endpoint list | Ensure UI uses `allowedNextStatuses` from API, not hard-coded buttons |
| Error handling | Draft `GlobalExceptionHandler` and frontend error utilities | Validate HTTP status codes and user-facing messages |
| Documentation | Draft README and markdown deliverables | Verify setup steps work on local machine; fill in candidate-specific details |
| Debugging | Explain stack traces, suggest fixes for test failures | Reproduce issue, apply fix, re-run tests |

**Principles:**
- Use AI for boilerplate, test scaffolding, and first drafts — not for blindly accepting business logic.
- Always run `./gradlew test` and manual UI checks after AI-generated changes.
- Log significant AI interactions in `ai-usage-log.md` with prompt summary and outcome.

## Risks

| Risk | Likelihood | Impact |
|------|------------|--------|
| Status transition rules implemented incorrectly or only in the UI | Medium | High — core requirement fails |
| Frontend hard-codes allowed transitions instead of using API | Medium | High — violates backend-as-source-of-truth |
| PostgreSQL not running or wrong credentials during dev/test | Medium | Medium — blocks backend startup and integration tests |
| Scope creep (auth, audit trail, Docker) | Medium | Medium — delays core delivery |
| AI-generated code with subtle bugs (wrong HTTP verbs, missing validation) | Medium | Medium — fails acceptance tests |
| CORS misconfiguration blocks frontend API calls | Low | Medium — UI appears broken |
| Integration tests depend on live DB state | Low | Medium — flaky or non-reproducible test runs |
| Incomplete documentation causes reviewer setup failures | Low | High — affects assessment score |

## Mitigation

| Risk | Mitigation |
|------|------------|
| Incorrect status rules | Centralize transitions in `TicketStatusTransitionValidator`; cover all paths with unit + integration tests before building UI |
| Hard-coded UI transitions | Render status buttons only from `allowedNextStatuses` in ticket detail response; add acceptance criterion check |
| PostgreSQL setup issues | Document defaults in README; use `application-test.yml` profile; verify DB exists before running tests |
| Scope creep | Explicit out-of-scope list in README (no auth, no audit trail, no Docker); defer extras unless time remains |
| AI code quality | Review every AI diff; run full test suite after each major change; prefer small, focused prompts |
| CORS issues | Configure `CorsConfig` for `http://localhost:5173` early; smoke-test from browser on day one of frontend work |
| Flaky integration tests | Use `@ActiveProfiles("test")`; create tickets in test setup with unique titles; assert DB state after each transition |
| Documentation gaps | Follow README checklist (prereqs, env vars, endpoints, run steps); run setup from scratch before submission |
