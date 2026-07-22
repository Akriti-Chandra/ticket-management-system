# API Contract

**Base URL:** `http://localhost:8080/api`  
**Content-Type:** `application/json`  
**OpenAPI:** `/swagger-ui.html` · `/v3/api-docs`

### Shared types

```json
// UserSummary (nested in ticket/comment responses)
{ "id": 1, "name": "Alice Johnson" }

// TicketStatus
"OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "CANCELLED"

// TicketPriority
"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

// UserRole
"EMPLOYEE" | "SUPPORT_AGENT" | "ADMIN"
```

### Shared error shapes

```json
// ErrorResponse (400 invalid transition, 404, 500)
{ "message": "Cannot transition from OPEN to CLOSED" }

// ValidationErrorResponse (400 validation)
{
  "message": "Validation Failed",
  "errors": [
    { "field": "title", "message": "must not be blank" }
  ]
}
```

---

## Endpoint: Create Ticket

**Method:** `POST`  
**Path:** `/api/tickets`  
**Purpose:** Create a new support ticket. Status is always set to `OPEN` by the server.

### Request

```json
{
  "title": "VPN not connecting",
  "description": "Cannot connect to corporate VPN since this morning.",
  "priority": "HIGH",
  "assignedToId": 3,
  "createdById": 1
}
```

### Response `201 Created`

```json
{
  "id": 10,
  "title": "VPN not connecting",
  "description": "Cannot connect to corporate VPN since this morning.",
  "priority": "HIGH",
  "status": "OPEN",
  "assignedTo": { "id": 3, "name": "Carol Davis" },
  "createdBy": { "id": 1, "name": "Alice Johnson" },
  "createdAt": "2026-07-19T10:30:00Z",
  "updatedAt": "2026-07-19T10:30:00Z",
  "allowedNextStatuses": ["IN_PROGRESS", "CANCELLED"]
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, not blank, max 200 characters |
| `description` | Required, not blank |
| `priority` | Required; one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `assignedToId` | Required; must reference an existing user |
| `createdById` | Required; must reference an existing user |

### Error Responses

| Status | When |
|--------|------|
| `400` | Validation failure (`ValidationErrorResponse`) |
| `404` | `assignedToId` or `createdById` does not exist |
| `500` | Unexpected server error |

---

## Endpoint: List / Search Tickets

**Method:** `GET`  
**Path:** `/api/tickets`  
**Purpose:** Return a paginated list of tickets with optional keyword search and status filter. Sorted by `updatedAt` descending.

### Request

Query parameters (all optional except defaults):

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `keyword` | string | — | Case-insensitive match on `title` or `description` |
| `status` | TicketStatus | — | Filter by exact status |
| `page` | int | `0` | Zero-based page index |
| `size` | int | `20` | Page size |

```
GET /api/tickets?keyword=vpn&status=OPEN&page=0&size=20
```

### Response `200 OK`

```json
{
  "content": [
    {
      "id": 10,
      "title": "VPN not connecting",
      "priority": "HIGH",
      "status": "OPEN",
      "assignedTo": { "id": 3, "name": "Carol Davis" },
      "updatedAt": "2026-07-19T10:30:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

### Validation Rules

| Param | Rules |
|-------|-------|
| `status` | If provided, must be a valid `TicketStatus` enum value |
| `page` | Must be ≥ 0 |
| `size` | Must be ≥ 1 |

### Error Responses

| Status | When |
|--------|------|
| `400` | Invalid `status` enum value |
| `500` | Unexpected server error |

---

## Endpoint: Get Ticket by ID

**Method:** `GET`  
**Path:** `/api/tickets/{id}`  
**Purpose:** Retrieve full ticket details including allowed next status transitions.

### Request

Path parameter: `id` (Long) — ticket ID.

```
GET /api/tickets/10
```

### Response `200 OK`

```json
{
  "id": 10,
  "title": "VPN not connecting",
  "description": "Cannot connect to corporate VPN since this morning.",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "assignedTo": { "id": 3, "name": "Carol Davis" },
  "createdBy": { "id": 1, "name": "Alice Johnson" },
  "createdAt": "2026-07-19T10:30:00Z",
  "updatedAt": "2026-07-19T14:00:00Z",
  "allowedNextStatuses": ["RESOLVED", "CANCELLED"]
}
```

### Validation Rules

| Param | Rules |
|-------|-------|
| `id` | Must be a valid numeric ticket ID |

### Error Responses

| Status | When |
|--------|------|
| `404` | Ticket not found |
| `500` | Unexpected server error |

---

## Endpoint: Update Ticket

**Method:** `PUT`  
**Path:** `/api/tickets/{id}`  
**Purpose:** Update ticket metadata (title, description, priority, assignee). Does **not** change status.

### Request

```json
{
  "title": "VPN not connecting — updated",
  "description": "Still failing after reboot.",
  "priority": "CRITICAL",
  "assignedToId": 4
}
```

### Response `200 OK`

Same shape as **Get Ticket by ID** (`TicketResponse`), with updated fields and current `allowedNextStatuses`.

### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, not blank, max 200 characters |
| `description` | Required, not blank |
| `priority` | Required; valid `TicketPriority` |
| `assignedToId` | Required; must reference an existing user |

### Error Responses

| Status | When |
|--------|------|
| `400` | Validation failure |
| `404` | Ticket or assignee not found |
| `500` | Unexpected server error |

---

## Endpoint: Change Ticket Status

**Method:** `PATCH`  
**Path:** `/api/tickets/{id}/status`  
**Purpose:** Transition ticket to a new status. Validated against the server-side state machine.

### Request

```json
{
  "status": "IN_PROGRESS"
}
```

### Response `200 OK`

Same shape as **Get Ticket by ID** (`TicketResponse`), with updated `status` and refreshed `allowedNextStatuses`.

### Validation Rules

| Field / Rule | Details |
|--------------|---------|
| `status` | Required; valid `TicketStatus` |
| Transition rules | `OPEN` → `IN_PROGRESS`, `CANCELLED` |
| | `IN_PROGRESS` → `RESOLVED`, `CANCELLED` |
| | `RESOLVED` → `CLOSED` |
| | `CLOSED`, `CANCELLED` → *(no transitions allowed)* |

Invalid transitions are rejected **before** the database is updated.

### Error Responses

| Status | When | Example message |
|--------|------|-----------------|
| `400` | Invalid transition | `"Cannot transition from OPEN to CLOSED"` |
| `400` | Missing/invalid `status` field | `ValidationErrorResponse` |
| `404` | Ticket not found | `"Ticket not found with id: 99"` |
| `500` | Unexpected server error | `"An unexpected error occurred"` |

---

## Endpoint: List Comments

**Method:** `GET`  
**Path:** `/api/tickets/{ticketId}/comments`  
**Purpose:** List all comments for a ticket, ordered newest first.

### Request

Path parameter: `ticketId` (Long).

```
GET /api/tickets/10/comments
```

### Response `200 OK`

```json
[
  {
    "id": 5,
    "message": "Rebooted laptop, still failing.",
    "createdBy": { "id": 1, "name": "Alice Johnson" },
    "createdAt": "2026-07-19T11:00:00Z"
  },
  {
    "id": 4,
    "message": "Looking into this now.",
    "createdBy": { "id": 3, "name": "Carol Davis" },
    "createdAt": "2026-07-19T10:45:00Z"
  }
]
```

### Validation Rules

| Param | Rules |
|-------|-------|
| `ticketId` | Must reference an existing ticket |

### Error Responses

| Status | When |
|--------|------|
| `404` | Ticket not found |
| `500` | Unexpected server error |

---

## Endpoint: Add Comment

**Method:** `POST`  
**Path:** `/api/tickets/{ticketId}/comments`  
**Purpose:** Add a comment to a ticket.

### Request

```json
{
  "message": "Please try reinstalling the VPN client.",
  "createdById": 3
}
```

### Response `201 Created`

```json
{
  "id": 6,
  "message": "Please try reinstalling the VPN client.",
  "createdBy": { "id": 3, "name": "Carol Davis" },
  "createdAt": "2026-07-19T12:00:00Z"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `message` | Required, not blank |
| `createdById` | Required; must reference an existing user |
| `ticketId` (path) | Must reference an existing ticket |

### Error Responses

| Status | When |
|--------|------|
| `400` | Validation failure (blank message, missing `createdById`) |
| `404` | Ticket or user not found |
| `500` | Unexpected server error |

---

## Endpoint: List Users

**Method:** `GET`  
**Path:** `/api/users`  
**Purpose:** Return all users for assignee/creator dropdowns in the UI.

### Request

```
GET /api/users
```

No query parameters or request body.

### Response `200 OK`

```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "role": "EMPLOYEE"
  },
  {
    "id": 3,
    "name": "Carol Davis",
    "email": "carol.davis@example.com",
    "role": "SUPPORT_AGENT"
  }
]
```

### Validation Rules

None.

### Error Responses

| Status | When |
|--------|------|
| `500` | Unexpected server error |

---

## Status Transition Reference

| Current status | Allowed next statuses |
|----------------|----------------------|
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |
| `CLOSED` | — |
| `CANCELLED` | — |

`allowedNextStatuses` is included on every `TicketResponse` so clients can render only valid action buttons.
