# Acceptance Criteria

## Core

- [ ] A user can create a ticket with title, description, priority, assignee, and creator; the ticket is persisted with status `OPEN`.
- [ ] A user can list tickets with pagination (`page`, `size`).
- [ ] A user can filter the ticket list by status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`).
- [ ] A user can search tickets by keyword (title and/or description).
- [ ] A user can view a single ticket by ID, including assignee, creator, timestamps, and `allowedNextStatuses`.
- [ ] A user can update ticket title, description, priority, and assignee without changing status via the update endpoint.
- [ ] A user can change ticket status via `PATCH /api/tickets/{id}/status`.
- [ ] Valid status transitions are enforced:
  - [ ] `OPEN` → `IN_PROGRESS`
  - [ ] `OPEN` → `CANCELLED`
  - [ ] `IN_PROGRESS` → `RESOLVED`
  - [ ] `IN_PROGRESS` → `CANCELLED`
  - [ ] `RESOLVED` → `CLOSED`
- [ ] `CLOSED` and `CANCELLED` are terminal — no further transitions are allowed.
- [ ] A user can add a comment to a ticket (message + author).
- [ ] A user can list comments for a ticket, ordered newest first.
- [ ] A user can list seeded users for assignee/creator dropdowns in the UI.
- [ ] The frontend displays only status actions returned in `allowedNextStatuses` (no hard-coded transition buttons).
- [ ] The frontend provides pages for ticket list, create, detail, and edit.
- [ ] Seed data loads on first backend startup (users, sample tickets, comments) without duplication on restart.

## Validation

- [ ] Required fields are enforced on ticket creation (title, description, priority, assignee, creator).
- [ ] Blank or whitespace-only title is rejected with a field-level validation error.
- [ ] Title length respects the schema limit (max 200 characters).
- [ ] Priority must be one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- [ ] Status must be one of `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`.
- [ ] `assignedToId` and `createdById` must reference existing users.
- [ ] Comment message is required and cannot be blank.
- [ ] Invalid status transition requests are rejected before persisting any change.
- [ ] Database constraints prevent invalid priority/status values at the persistence layer.

## Error Handling

- [ ] Requesting a non-existent ticket returns `404 Not Found` with a clear message.
- [ ] Requesting a non-existent user (assignee/creator/comment author) returns `404 Not Found`.
- [ ] Validation failures return `400 Bad Request` with field-level error details.
- [ ] Invalid status transitions return `400 Bad Request` with a message naming the `from` and `to` statuses.
- [ ] Failed status transitions do not modify the ticket status in the database.
- [ ] Unexpected server errors return `500 Internal Server Error` with a generic message (no stack trace leaked to the client).
- [ ] The frontend surfaces API errors to the user (e.g., snackbar or inline message).

## Testing

- [ ] Unit tests cover the status transition validator (allowed and disallowed transitions).
- [ ] Service-layer tests cover ticket create, update, and status change behavior.
- [ ] Integration tests verify successful transitions: `OPEN` → `IN_PROGRESS`, `IN_PROGRESS` → `RESOLVED`, `RESOLVED` → `CLOSED`, and cancellation paths.
- [ ] Integration tests verify rejected transitions (e.g., `OPEN` → `CLOSED`, `RESOLVED` → `OPEN`, `CLOSED` → `IN_PROGRESS`) leave the DB unchanged.
- [ ] Integration tests cover validation errors (e.g., blank title on create).
- [ ] Integration tests cover comment creation and user listing.
- [ ] All backend tests pass via `./gradlew test` with PostgreSQL running locally.

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
