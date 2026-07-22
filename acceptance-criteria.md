# Acceptance Criteria

## Core

- [x] A user can create a ticket with title, description, priority, assignee, and creator; the ticket is persisted with status `OPEN`.
- [x] A user can list tickets with pagination (`page`, `size`).
- [x] A user can filter the ticket list by status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`).
- [x] A user can search tickets by keyword (title and/or description).
- [x] A user can view a single ticket by ID, including assignee, creator, timestamps, and `allowedNextStatuses`.
- [x] A user can update ticket title, description, priority, and assignee without changing status via the update endpoint.
- [x] A user can change ticket status via `PATCH /api/tickets/{id}/status`.
- [x] Valid status transitions are enforced:
  - [x] `OPEN` → `IN_PROGRESS`
  - [x] `OPEN` → `CANCELLED`
  - [x] `IN_PROGRESS` → `RESOLVED`
  - [x] `IN_PROGRESS` → `CANCELLED`
  - [x] `RESOLVED` → `CLOSED`
- [x] `CLOSED` and `CANCELLED` are terminal — no further transitions are allowed.
- [x] A user can add a comment to a ticket (message + author).
- [x] A user can list comments for a ticket, ordered newest first.
- [x] A user can list seeded users for assignee/creator dropdowns in the UI.
- [x] The frontend displays only status actions returned in `allowedNextStatuses` (no hard-coded transition buttons).
- [x] The frontend provides pages for ticket list, create, detail, and edit.
- [x] Seed data loads on first backend startup (users, sample tickets, comments) without duplication on restart.

## Validation

- [x] Required fields are enforced on ticket creation (title, description, priority, assignee, creator).
- [x] Blank or whitespace-only title is rejected with a field-level validation error.
- [x] Title length respects the schema limit (max 200 characters).
- [x] Priority must be one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- [x] Status must be one of `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`.
- [x] `assignedToId` and `createdById` must reference existing users.
- [x] Comment message is required and cannot be blank.
- [x] Invalid status transition requests are rejected before persisting any change.
- [x] Database constraints prevent invalid priority/status values at the persistence layer.

## Error Handling

- [x] Requesting a non-existent ticket returns `404 Not Found` with a clear message.
- [x] Requesting a non-existent user (assignee/creator/comment author) returns `404 Not Found`.
- [x] Validation failures return `400 Bad Request` with field-level error details.
- [x] Invalid status transitions return `400 Bad Request` with a message naming the `from` and `to` statuses.
- [x] Failed status transitions do not modify the ticket status in the database.
- [x] Unexpected server errors return `500 Internal Server Error` with a generic message (no stack trace leaked to the client).
- [x] The frontend surfaces API errors to the user (e.g., snackbar or inline message).

## Testing

- [x] Unit tests cover the status transition validator (allowed and disallowed transitions).
- [x] Service-layer tests cover ticket create, update, and status change behavior.
- [x] Integration tests verify successful transitions: `OPEN` → `IN_PROGRESS`, `IN_PROGRESS` → `RESOLVED`, `RESOLVED` → `CLOSED`, and cancellation paths.
- [x] Integration tests verify rejected transitions (e.g., `OPEN` → `CLOSED`, `RESOLVED` → `OPEN`, `CLOSED` → `IN_PROGRESS`) leave the DB unchanged.
- [x] Integration tests cover validation errors (e.g., blank title on create).
- [x] Integration tests cover comment creation and user listing.
- [x] All backend tests pass via `./gradlew test` with PostgreSQL running locally.
- [x] Frontend component tests pass via `npm test` (Vitest + React Testing Library).

## Documentation

- [x] `README.md` describes prerequisites, project structure, and how to run backend and frontend.
- [x] `README.md` documents PostgreSQL setup, default connection settings, and environment variable overrides.
- [x] `README.md` lists all REST API endpoints with HTTP method and purpose.
- [x] Swagger UI is available at `/swagger-ui.html` and OpenAPI spec at `/v3/api-docs`.
- [ ] `candidate-info.md` captures candidate and project metadata, including Project Summary, Tools Used, Setup Summary, and Submission Date.
- [x] `requirements-analysis.md` documents understanding, functional/non-functional requirements, assumptions, clarifications, and edge cases.
- [x] `acceptance-criteria.md` (this file) defines verifiable done conditions for the assignment.
- [x] `implementation-plan.md` covers overview, task breakdown, milestones, AI usage plan, risks, and mitigation.
- [x] `design-notes.md` documents architecture, frontend/backend/database design, validation, and error-handling strategy.
- [x] `api-contract.md` defines per-endpoint request/response shapes, validation rules, and error responses.
- [x] `test-strategy.md` describes test scope, unit/integration coverage, edge cases, and known gaps.
- [x] `debugging-notes.md` records issues encountered, investigation steps, AI assistance, and fixes.
- [x] `code-review-notes.md` summarizes AI-assisted review, observations, post-review changes, and rejected suggestions.
- [x] `reflection.md` covers what was built, AI usage across the lifecycle, validation approach, and reusable workflow.
- [x] `pr-description.md` provides PR-style summary, features, technical changes, testing, and known limitations.
