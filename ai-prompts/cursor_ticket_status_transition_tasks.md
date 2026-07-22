# Ticket status transition tasks
_Exported on 7/22/2026 at 19:23:37 GMT+5:30 from Cursor (3.6.31)_

---

**User**

Implement the following to-dos from the plan (the plan is attached for your reference). Do NOT edit the plan file itself.

You have been assigned the following 1 to-do(s) with IDs: state-machine

1. [state-machine] Implement TicketStatusTransitionValidator and InvalidStatusTransitionException; wire into TicketService only

These to-dos have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the assigned to-dos.

---

**Cursor**

I'll implement the status transition validator and wire it into `TicketService`. Exploring the codebase and marking the todo in progress.


Implementing the validator, exception, and `TicketService` with status-update wiring.


Fixing the Mockito setup for the void `validate` method, then running tests.


Updating the context test so it works with the new `TicketService` bean.


The **state-machine** todo is done. Here’s what was added and how it fits together.

### What changed

**1. `InvalidStatusTransitionException`** (`backend/src/main/java/com/ticketsystem/exception/InvalidStatusTransitionException.java`)  
Runtime exception for invalid status transitions, with a clear message like `"Cannot transition from OPEN to CLOSED"`.

**2. `TicketStatusTransitionValidator`** (`backend/src/main/java/com/ticketsystem/validation/TicketStatusTransitionValidator.java`)  
Centralized state machine per the plan:

- `OPEN` → `IN_PROGRESS`, `CANCELLED`
- `IN_PROGRESS` → `RESOLVED`, `CANCELLED`
- `RESOLVED` → `CLOSED`
- `CLOSED` / `CANCELLED` → no further transitions

Exposes `validate(from, to)` and `getAllowedNextStatuses(current)`.

**3. `TicketService`** (`backend/src/main/java/com/ticketsystem/service/TicketService.java`)  
`updateStatus()` is the only path that changes ticket status:

1. Load ticket (404 via `ResourceNotFoundException` if missing)
2. Call the validator
3. Persist the new status

Also exposes `getAllowedNextStatuses()` for later use in ticket detail responses.

**4. Tests**
- `TicketStatusTransitionValidatorTest` — valid/invalid transitions and allowed-next-status sets
- `TicketServiceTest` — success, not-found, and invalid-transition cases
- `TicketManagementApplicationTests` — added `@MockBean TicketRepository` so the context still loads without a database

### Files modified/created

| File | Action |
|------|--------|
| `exception/InvalidStatusTransitionException.java` | Created |
| `exception/ResourceNotFoundException.java` | Created (needed for `updateStatus` lookup) |
| `validation/TicketStatusTransitionValidator.java` | Created |
| `service/TicketService.java` | Created |
| `test/.../TicketStatusTransitionValidatorTest.java` | Created |
| `test/.../TicketServiceTest.java` | Created |
| `test/.../TicketManagementApplicationTests.java` | Updated |

All backend tests pass (`.\gradlew test`). The validator is not wired into controllers yet — that’s for the services/controllers todo.

