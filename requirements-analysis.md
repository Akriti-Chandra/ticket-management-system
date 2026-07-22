# Requirement Analysis

## Selected Project Option

**Support Ticket Management System** — a full-stack application for creating, tracking, and resolving internal support tickets with an enforced status workflow.

## My Understanding (in your own words)

The system is an internal support desk tool where employees can raise issues and support agents can work them through a defined lifecycle. Each ticket has core metadata (title, description, priority, assignee, creator) and moves through statuses in a strict order: `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`. Tickets may also be cancelled from `OPEN` or `IN_PROGRESS`.

The backend is the source of truth for all business rules, especially status transitions. The frontend should not hard-code which status changes are allowed; it should display only the transitions returned by the API (`allowedNextStatuses`). Users can add comments on tickets to capture progress or communication, but there is no login — the UI lets you pick a user from seeded data when creating tickets or comments.

Ticket fields (title, description, priority, assignee) are edited separately from status changes. Listing supports keyword search, status filtering, and pagination.

## Functional Requirements

### Ticket management
- Create a ticket with title, description, priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), assignee, and creator; new tickets start in `OPEN`.
- List tickets with optional keyword search (title/description), status filter, and pagination.
- View ticket detail including current status and allowed next statuses.
- Update ticket title, description, priority, and assignee (status is not changed via the update endpoint).
- Change ticket status via a dedicated endpoint, validated against the state machine.

### Status workflow
| Current status | Allowed next statuses |
|----------------|----------------------|
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |
| `CLOSED` | *(none — terminal)* |
| `CANCELLED` | *(none — terminal)* |

Invalid transitions must be rejected with a clear error message and must not modify the database.

### Comments
- Add a comment to a ticket (message + author).
- List comments for a ticket, newest first.

### Users
- List users for assignee/creator dropdowns in the UI.
- Users have roles (`EMPLOYEE`, `SUPPORT_AGENT`, `ADMIN`) in the data model, though role-based access is not enforced in the current scope.

### API surface
- REST API under `/api` with Swagger/OpenAPI documentation.
- Standard error responses for validation failures, not-found resources, and invalid status transitions.

## Non-Functional Requirements

- **Separation of concerns:** Business rules (especially status transitions) live in the backend; the frontend is a thin client.
- **Data integrity:** Status transitions are validated server-side; invalid requests leave the ticket unchanged.
- **Persistence:** PostgreSQL with schema constraints (e.g., valid priority/status values, foreign keys).
- **Testability:** Integration tests cover happy-path transitions, rejected transitions, and validation errors.
- **Developer experience:** Clear local setup (README), seed data for quick demo, CORS configured for the Vite dev server.
- **API documentation:** OpenAPI/Swagger available for exploring endpoints.

## Assumptions

- PostgreSQL runs locally; no Docker Compose is required.
- Users are pre-seeded; there is no registration or user-management UI.
- No authentication or authorization — any UI user can perform any action by selecting a user from the dropdown.
- A single organization/tenant; no multi-tenancy.
- English-only UI and API messages.
- Ticket assignee is required at creation time.
- Comments cannot be edited or deleted after creation.
- Status change history/audit trail is out of scope.

## Clarifications (questions for a product owner)

1. Should user roles (`EMPLOYEE`, `SUPPORT_AGENT`, `ADMIN`) restrict who can create tickets, change status, or assign tickets?
2. Can a ticket be reassigned after it is `RESOLVED` or `CLOSED`, or should edits be blocked for terminal statuses?
3. Should cancellation require a reason or comment?
4. Is reopening a `CLOSED` or `CANCELLED` ticket ever allowed (e.g., `CLOSED` → `OPEN`)?
5. Who is allowed to close a ticket — only the assignee, the creator, or any support agent?
6. Should keyword search match comments as well as title/description?
7. Is there a maximum page size or expected ticket volume that affects pagination defaults?
8. Are notifications (email/Slack) expected when status changes or comments are added?

## Edge Cases

- **Invalid status transition:** Requesting e.g. `OPEN` → `CLOSED` or `RESOLVED` → `OPEN` returns `400 Bad Request` with a descriptive message; DB status is unchanged.
- **Terminal statuses:** `CLOSED` and `CANCELLED` tickets have no allowed next statuses; the UI should show no status action buttons.
- **Same-status update:** Attempting to transition to the current status should be rejected (not a no-op).
- **Missing ticket/user:** Referencing a non-existent ticket or user ID returns `404 Not Found`.
- **Validation failures:** Blank or over-length title, missing required fields, or invalid enum values return `400` with field-level errors.
- **Assignee does not exist:** Creating or updating a ticket with an invalid `assignedToId` fails.
- **Comments on any status:** Comments can be added regardless of ticket status (unless product rules say otherwise).
- **Concurrent updates:** Two clients updating the same ticket simultaneously — last write wins; no optimistic locking in current scope.
- **Empty search results:** List endpoint returns an empty page with correct pagination metadata.
- **Deleting users:** Users are referenced by tickets and comments; deletion behavior is undefined without explicit rules (likely should be prevented).
