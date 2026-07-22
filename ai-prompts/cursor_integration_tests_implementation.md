# Integration tests implementation
_Exported on 7/22/2026 at 19:23:59 GMT+5:30 from Cursor (3.6.31)_

---

**User**

Implement the following to-dos from the plan (the plan is attached for your reference). Do NOT edit the plan file itself.

You have been assigned the following 1 to-do(s) with IDs: integration-tests

1. [integration-tests] Write TicketStatusTransitionIntegrationTest covering all valid/invalid transitions (HTTP + DB + message)

These to-dos have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the assigned to-dos.

---

**Cursor**

I'll implement the integration tests for ticket status transitions. First I'm exploring the backend structure and any existing test setup.


Creating the integration test class with Testcontainers and the full transition matrix.


Implemented `TicketStatusTransitionIntegrationTest` at `backend/src/test/java/com/ticketsystem/integration/TicketStatusTransitionIntegrationTest.java`.

## What was added

**Test infrastructure**
- `@SpringBootTest(webEnvironment = RANDOM_PORT)` with `TestRestTemplate` for full HTTP stack
- Testcontainers PostgreSQL (`postgres:16-alpine`) with `@DynamicPropertySource` for datasource config
- Seeded users from `data.sql` used via `UserRepository`

**Status transition matrix (10 tests)**

| Transition | Expected |
|---|---|
| OPEN → IN_PROGRESS | 200, DB updated |
| IN_PROGRESS → RESOLVED | 200, DB updated |
| RESOLVED → CLOSED | 200, DB updated |
| OPEN → CANCELLED | 200, DB updated |
| IN_PROGRESS → CANCELLED | 200, DB updated |
| OPEN → CLOSED | 400, message contains "Cannot transition", DB unchanged |
| OPEN → RESOLVED | 400, message + DB unchanged |
| RESOLVED → OPEN | 400, message + DB unchanged |
| CANCELLED → OPEN | 400, message + DB unchanged |
| CLOSED → IN_PROGRESS | 400, message + DB unchanged |

Each test asserts HTTP status, response body (`status` or `message`), and the `status` column in the database.

**Smoke tests (from the plan)**
- Create ticket with blank title → 400 validation errors
- Comment creation → 201
- User list → returns seeded users

## Running the tests

```bash
cd backend
.\gradlew.bat test --tests "com.ticketsystem.integration.TicketStatusTransitionIntegrationTest"
```

**Note:** These tests require **Docker** (Testcontainers). Docker is not available in this environment, so the suite failed at container startup (`Could not find a valid Docker environment`). Unit tests compile and pass. Install/start Docker Desktop, then rerun the integration tests locally.

---

**User**

docker is installed please run again

---

**Cursor**

Docker still isn't reachable from this shell — checking installation and daemon status.


Docker is installed but the daemon isn't running. Starting Docker Desktop and waiting for it to be ready.


---

**User**

is their other way without docker

---

**Cursor**

Yes — we can run against your local PostgreSQL instead of Testcontainers. I'll switch the integration tests to use that.


Switching the integration tests to local PostgreSQL via a `test` profile — same setup as dev, no Docker required.


Schema init was running after Hibernate validation. Updating the test profile so `schema.sql` runs first.


Context loads now. Three tests pass; PATCH fails because `TestRestTemplate` doesn't support PATCH on the default client. Switching to `MockMvc`.


Yes. The integration tests now use **local PostgreSQL** instead of Docker/Testcontainers. All **13 tests pass**.

## What changed

1. **Removed Testcontainers** — no Docker required.
2. **Added `application-test.yml`** — connects to `jdbc:postgresql://localhost:5432/ticket_management` (same as dev).
3. **Switched to `MockMvc`** — `TestRestTemplate` doesn't support `PATCH` on the default HTTP client.
4. **Fixed SQL init order** — set `defer-datasource-initialization: false` so `schema.sql` runs before Hibernate validation.

## Requirements

- PostgreSQL running on `localhost:5432`
- Database `ticket_management` exists
- Credentials match `application-test.yml` (default: `postgres` / `Password`, overridable via `DB_USERNAME` / `DB_PASSWORD`)

Create the database if needed:

```sql
CREATE DATABASE ticket_management;
```

## Run tests

```bash
cd backend
.\gradlew.bat test --tests "com.ticketsystem.integration.TicketStatusTransitionIntegrationTest"
```

This still exercises the full Spring stack (controllers, services, repositories, and PostgreSQL) — only the containerized database was replaced with your local instance.

