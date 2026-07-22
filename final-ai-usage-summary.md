# Final AI Usage Summary

Consolidated record of how **Cursor** was used to build the Support Ticket Management System.

**Candidate:** Akriti Chandra  
**Primary stack:** Java 21, Spring Boot 3.3, PostgreSQL, React, TypeScript, Vite, MUI  
**AI tool:** Cursor  
**Project:** Support Ticket Management System

---

## Overview

AI was used across the full lifecycle — planning, scaffolding, implementation, testing, debugging, documentation, and code review. The working pattern was:

> **AI generates first drafts and boilerplate; human verifies business rules, runs tests, and performs manual E2E checks.**

The backend status state machine was the highest-risk area and received the most human validation (unit + integration tests + Swagger + browser testing).

---

## Usage by phase

| Phase | AI contribution | Human verification |
|-------|-----------------|-------------------|
| **Planning** | Drafted `requirements-analysis.md`, `acceptance-criteria.md`, `implementation-plan.md` | Confirmed scope; rejected auth, Docker, audit trail |
| **Backend scaffold** | Gradle project, entities, repositories, `schema.sql`, `data.sql` | Verified package structure, enums, FK constraints |
| **Domain layer** | JPA entities, enums, repositories, seed SQL | Cross-checked against assignment status workflow |
| **Status machine** | `TicketStatusTransitionValidator`, service integration | Ran full transition matrix tests |
| **REST API** | DTOs, controllers, mappers, `GlobalExceptionHandler`, OpenAPI | Verified `PUT` vs `PATCH /status` split |
| **Integration tests** | MockMvc tests for transitions, validation, comments | Fixed Mockito void stubbing; verified DB assertions |
| **Frontend scaffold** | Vite app, Axios client, types, routing, MUI layout | Confirmed types mirror API DTOs |
| **Frontend pages** | List, create, detail, edit pages | Verified status buttons use `allowedNextStatuses` only |
| **Debugging** | Diagnosed lazy-load, SQL init, backend-not-running | Reproduced locally; applied targeted fixes |
| **Documentation** | Design notes, API contract, test strategy, debugging/review notes | Cross-checked against actual code |
| **UX polish** | Centered forms, Back button, removed duplicate controls | Directed from manual testing |
| **Database folder** | `database/` schema, seed scripts, setup notes | Aligned with backend classpath SQL |

---

## Prompt sessions (archived)

Cursor conversation exports are stored in `ai-prompts/`:

| File | Topic |
|------|-------|
| `cursor_support_ticket_management_system.md` | Initial project plan and architecture |
| `cursor_backend_scaffold_implementation.md` | Gradle + Spring Boot setup |
| `cursor_domain_layer_implementation.md` | Entities, schema, seed data |
| `cursor_ticket_status_transition_tasks.md` | Status validator and service |
| `cursor_rest_api_implementation_tasks.md` | Controllers, DTOs, error handling |
| `cursor_integration_tests_implementation.md` | MockMvc integration tests |
| `cursor_frontend_scaffold_implementation.md` | Vite + React + API modules |
| `cursor_frontend_pages_implementation.md` | All four page components |
| `cursor_readme_setup_instructions.md` | README and setup docs |

---

## What AI helped most

1. **Velocity on boilerplate** — entities, DTOs, controllers, mappers, React pages scaffolded quickly so effort focused on the status state machine.
2. **Test scaffolding** — integration tests for every valid/invalid transition with DB state assertions.
3. **Documentation drafts** — `api-contract.md`, `design-notes.md`, `test-strategy.md` generated from codebase context.
4. **Debugging speed** — narrowed `LazyInitializationException` to fetch strategy; identified operational "Unable to reach server" causes.
5. **Consistent patterns** — error handling, CORS, repository queries applied uniformly.

---

## What AI got wrong (and how it was caught)

| Issue | Detection | Resolution |
|-------|-----------|------------|
| Lazy loading with `open-in-view: false` | `500` in Swagger on ticket detail | `JOIN FETCH` in repository |
| Mockito void stubbing syntax | Test compile/run failure | `doThrow().when(...)` |
| Smoke test without DB | `./gradlew build` failure | Exclude DataSource autoconfig in smoke test |
| Empty SQL scripts | Backend startup error | Valid no-op SQL, then full DDL |
| Over-scoping (auth, Docker, MapStruct, React Query) | Requirements review | Rejected; documented as out-of-scope |

**Lesson:** AI is strong at structure but can miss runtime interactions (JPA boundaries, Mockito APIs, Spring init order). Always run build + tests + manual smoke after accepting changes.

---

## Validation approach

| Method | When used |
|--------|-----------|
| `.\gradlew.bat build` | After every major backend change |
| `npm run build` | After frontend changes |
| `./gradlew test` | Validator, service, integration suites |
| Swagger UI | Manual API testing |
| Browser E2E | Full ticket lifecycle + status buttons |
| Doc cross-check | `api-contract.md` vs controllers/DTOs |

No AI-generated code was accepted without at least one of: build, test suite, or manual smoke test.

---

## Principles followed

- **Backend owns business rules** — frontend uses `allowedNextStatuses` from API only.
- **Minimal dependencies** — no MapStruct, React Query, or Testcontainers unless justified.
- **Reject out-of-scope suggestions** — auth, Docker, audit trail deferred.
- **Separate update from status change** — `PUT` for metadata, `PATCH /status` for state machine.
- **Document assumptions** — open questions logged rather than guessed.

---

## Artifacts produced with AI assistance

### Code

- Spring Boot REST API (controllers, services, repositories, validation)
- React SPA (4 pages, API modules, shared components/hooks)
- 20 backend tests (unit, service, integration)
- PostgreSQL schema and seed data

### Documentation

| Document | Purpose |
|----------|---------|
| `requirements-analysis.md` | Scope and assumptions |
| `acceptance-criteria.md` | Verifiable done conditions |
| `implementation-plan.md` | Phases and milestones |
| `design-notes.md` | Architecture and layer design |
| `data-model.md` | Entity-relationship model |
| `ui-flow.md` | Screen flows and navigation |
| `api-contract.md` | Endpoint request/response specs |
| `test-strategy.md` | Test pyramid and gaps |
| `debugging-notes.md` | Issue investigation log |
| `code-review-notes.md` | Review findings |
| `review-fixes.md` | Post-review changes |
| `reflection.md` | Lifecycle retrospective |
| `final-ai-usage-summary.md` | This document |
| `database/setup-notes.md` | Database setup guide |

---

## Recommended follow-ups (post-submission)

| Priority | Item |
|----------|------|
| High | Testcontainers for CI-friendly integration tests |
| High | Frontend tests (Vitest + RTL) for status button rendering |
| Medium | Integration tests for `PUT`, list/search |
| Medium | Role-based authorization (`UserRole` enforcement) |
| Low | Status change audit trail, optimistic locking |

---

## One-line takeaway

> Use AI to go fast on structure and docs; use tests and manual E2E to stay correct on business rules.
