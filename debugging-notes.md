# Debugging Notes

## Issue 1

### Problem

Frontend showed **"Unable to reach server"** on every API call (ticket list, create, detail) after implementing the UI pages. The Vite dev server at `http://localhost:5173` loaded fine, but no data appeared and the snackbar displayed the Axios network error from `errorUtils.ts`.

### How I Investigated

1. Confirmed the error message comes from `getErrorMessage()` when `axios.isAxiosError(error) && !error.response` — meaning the request never reached the backend (not a 4xx/5xx).
2. Checked whether anything was listening on port 8080 — connection refused.
3. Verified the frontend was running on 5173 and `VITE_API_BASE_URL` defaulted to `http://localhost:8080/api` in `axiosClient.ts`.
4. Checked `CorsConfig.java` — CORS was already configured for `localhost:5173`, so the issue was not cross-origin blocking.
5. Attempted to start the backend with `.\gradlew.bat bootRun` and confirmed PostgreSQL was reachable.

### How AI Helped

Cursor ran connectivity checks (`Invoke-WebRequest` to `/api/users` and `/api/tickets`), inspected terminal state, and started the backend in a background shell. It confirmed the root cause was a **stopped backend process**, not a frontend or CORS bug, and pointed to the two-terminal startup workflow in the README.

### What I Validated

- `GET http://localhost:8080/api/users` → `200 OK` with seeded user JSON.
- `GET http://localhost:8080/api/tickets` → `200 OK` with paginated ticket list.
- Frontend ticket list loaded after a browser refresh with no code changes.
- CORS preflight was not needed as a fix — backend simply had to be running.

### Final Fix

**No code change required.** Start both services:

```powershell
# Terminal 1
cd backend
.\gradlew.bat bootRun

# Terminal 2
cd frontend
npm run dev
```

Documented this in `README.md` under "Typical local workflow" so reviewers know both apps must be running.

---

## Issue 2

### Problem

Backend failed to start with:

```
FATAL: password authentication failed for user "postgres"
```

After correcting credentials, a second startup failure occurred because Spring SQL initialization rejected **empty** `schema.sql` and `data.sql` files.

### How I Investigated

1. Read the full stack trace from `bootRun` — `PSQLException` pointed to authentication, not missing tables.
2. Compared `application.yml` defaults (`postgres` / `Password`) against the local PostgreSQL installation password.
3. After updating credentials, a new error appeared referencing SQL script execution on empty files.
4. Checked `spring.sql.init.mode: always` in `application.yml` — Spring Boot expects valid SQL even when schema/data are placeholders.

### How AI Helped

Cursor identified the two separate failures in sequence: first authentication, then empty-script init. It suggested adding harmless no-op statements to the SQL files so init could complete before the domain layer was fully implemented:

```sql
SELECT 1 WHERE FALSE;
```

It also recommended using `SPRING_DATASOURCE_*` environment variables instead of hardcoding passwords.

### What I Validated

- PostgreSQL reachable on `localhost:5432` with correct password.
- `CREATE DATABASE ticket_management` exists.
- Backend logs show `Started TicketManagementApplication` after SQL init completes.
- Tables and seed data load correctly once full `schema.sql` / `data.sql` were added in a later phase.

### Final Fix

1. Set database credentials to match local PostgreSQL (via `application.yml` or env vars).
2. Replaced empty SQL scripts with valid no-op statements until real DDL/seed data were written.
3. Later replaced no-ops with full `schema.sql` (tables, constraints, indexes) and `data.sql` (idempotent seed inserts).
4. Set `defer-datasource-initialization: true` in main `application.yml` so Hibernate validates schema before data loads.

---

## Issue 3

### Problem

`GET /api/tickets/{id}` returned **500 Internal Server Error** with a `LazyInitializationException` when loading ticket detail. The error referenced `assignedTo` or `createdBy` on the `Ticket` entity — Hibernate tried to lazy-load `User` associations **outside** an active persistence context.

This surfaced after setting `spring.jpa.open-in-view: false` (a best practice to avoid keeping DB connections open for the entire HTTP request).

### How I Investigated

1. Reproduced via Swagger UI: `GET /api/tickets/1` failed; `GET /api/tickets` (list) worked.
2. Compared the two code paths — list used `@EntityGraph(attributePaths = "assignedTo")`; detail used `findById()` without fetching related users.
3. Checked `Ticket.java` — `assignedTo` and `createdBy` are `@ManyToOne(fetch = FetchType.LAZY)`.
4. Traced the call: `TicketController.getById` → `TicketService.findById` → `ticketRepository.findById` → `TicketMapper.toResponse` accesses `ticket.getAssignedTo().getName()` after the `@Transactional` read-only scope ended.

### How AI Helped

Cursor explained the interaction between `open-in-view: false` and lazy loading, and suggested adding an explicit fetch query rather than re-enabling OSIV. It generated a `findByIdWithUsers` repository method using `JOIN FETCH`:

```java
@Query("SELECT t FROM Ticket t JOIN FETCH t.assignedTo JOIN FETCH t.createdBy WHERE t.id = :id")
Optional<Ticket> findByIdWithUsers(@Param("id") Long id);
```

And updated `TicketService` to use this method for all detail/update/status responses.

### What I Validated

- `GET /api/tickets/{id}` returns `200` with `assignedTo` and `createdBy` populated.
- `PUT`, `PATCH /status`, and `POST /tickets` responses also include user names (all use `findByIdWithUsers` after save).
- `open-in-view` remains `false` — no regression on connection handling.
- Frontend detail page displays assignee and creator names correctly.

### Final Fix

Added `TicketRepository.findByIdWithUsers()` with `JOIN FETCH` for both user associations. Updated `TicketService` to call this method wherever a full `TicketResponse` (with user names) is returned. Kept `open-in-view: false`.

---

## Issue 4

### Problem

`TicketServiceTest.updateStatus_propagatesInvalidTransition` failed at compile or runtime because Mockito's `when(...).thenThrow(...)` does not work on **void** methods. The test tried to stub `statusTransitionValidator.validate()` to throw `InvalidStatusTransitionException`.

### How I Investigated

1. Ran `.\gradlew.bat test` — failure pointed to the Mockito stubbing line in `TicketServiceTest`.
2. Confirmed `TicketStatusTransitionValidator.validate()` returns `void`.
3. Reviewed Mockito docs — void methods require `doThrow().when(mock).method()` instead of `when(mock.method()).thenThrow()`.

### How AI Helped

Cursor identified the Mockito API mismatch immediately and replaced:

```java
when(statusTransitionValidator.validate(...)).thenThrow(...)
```

with:

```java
doThrow(new InvalidStatusTransitionException("..."))
    .when(statusTransitionValidator).validate(TicketStatus.OPEN, TicketStatus.CLOSED);
```

### What I Validated

- `TicketServiceTest` — all 3 tests pass.
- Full `./gradlew.bat test` suite passes (unit + integration).
- Test still asserts: exception propagated, `ticketRepository.save()` never called, ticket status unchanged.

### Final Fix

Use `doThrow().when(...)` for stubbing void methods in Mockito. Added `import static org.mockito.Mockito.doThrow`.
