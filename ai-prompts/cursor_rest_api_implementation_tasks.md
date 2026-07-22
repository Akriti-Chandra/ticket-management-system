# Rest API implementation tasks
_Exported on 7/22/2026 at 19:23:47 GMT+5:30 from Cursor (3.6.31)_

---

**User**

Implement the following to-dos from the plan (the plan is attached for your reference). Do NOT edit the plan file itself.

You have been assigned the following 1 to-do(s) with IDs: rest-api

1. [rest-api] Build DTOs, mappers, services, controllers, GlobalExceptionHandler, CORS, and springdoc OpenAPI

These to-dos have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the assigned to-dos.

---

**Cursor**

I'll implement the REST API layer from the plan. Exploring the codebase to see what's already in place, then building DTOs, mappers, services, controllers, and config.


Implementing the REST API layer: DTOs, mappers, extended services, controllers, and configuration.


Fixing lazy-loading: with `open-in-view: false`, user associations must be fetched before the service transaction ends.


The **rest-api** todo is complete. Here is what was added and changed.

## Summary

### DTOs (`dto/request`, `dto/response`)
- **Requests:** `CreateTicketRequest`, `UpdateTicketRequest`, `UpdateTicketStatusRequest`, `CreateCommentRequest` (with Bean Validation)
- **Responses:** `TicketResponse`, `TicketSummaryResponse`, `CommentResponse`, `UserResponse`, `UserSummary`, `PageResponse`, `ErrorResponse`, `ValidationErrorResponse`, `FieldError`

### Mappers (`mapper/`)
- Manual static mappers: `UserMapper`, `TicketMapper`, `CommentMapper`

### Services (`service/`)
- **`TicketService`** — create, findById, search, update, updateStatus (status changes only via validator)
- **`CommentService`** — list comments (newest first), create comment
- **`UserService`** — read-only list of all users

### Controllers (`controller/`)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets` | Search/list (`keyword`, `status`, `page`, `size`) |
| GET | `/api/tickets/{id}` | Detail + `allowedNextStatuses` |
| PUT | `/api/tickets/{id}` | Update fields (no status) |
| PATCH | `/api/tickets/{id}/status` | Status transition |
| GET/POST | `/api/tickets/{ticketId}/comments` | List/add comments |
| GET | `/api/users` | List users |

### Exception handling
- **`GlobalExceptionHandler`** — 400 validation/business errors, 404 not found, 500 generic errors

### Config
- **`CorsConfig`** — allows `http://localhost:5173` on `/api/**`
- **`OpenApiConfig`** — OpenAPI metadata; Swagger UI at `/swagger-ui.html`

### Repository updates
- **`TicketRepository`** — search query + `findByIdWithUsers` (avoids lazy-load issues with `open-in-view: false`)
- **`CommentRepository`** — `@EntityGraph` for `createdBy`

### Tests
- Updated `TicketServiceTest` and `TicketManagementApplicationTests` for new dependencies
- All **7 tests pass** (`.\gradlew.bat test`)

Start the API with `cd backend; .\gradlew.bat bootRun` (PostgreSQL required). Swagger: `http://localhost:8080/swagger-ui.html`.

