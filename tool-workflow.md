# Tool Workflow

How **Cursor** was used to build the Support Ticket Management System, and how the same workflow would transfer to a production project.

**Candidate:** Akriti Chandra  
**Primary AI tool:** Cursor  
**Stack:** Java 21, Spring Boot 3.3, PostgreSQL, React, TypeScript, Vite, MUI

---

## Primary AI Tool Used

**Cursor** was the sole AI assistant for this project. It was used in Agent mode for multi-file implementation, in chat for planning and debugging, and with `@` file references to ground prompts in existing code and documentation.

Cursor was chosen because it:

- Operates inside the IDE with direct access to the workspace (read files, run tests, inspect terminals).
- Supports scoped, incremental prompts ("implement frontend pages only") without losing project context.
- Produces diffs that can be reviewed before acceptance — important for business-rule-heavy code.

**Working principle:**

> AI generates first drafts and boilerplate; the developer verifies business rules, runs tests, and performs manual end-to-end checks.

---

## How I Provide Project Context to the Tool

Context is layered so each prompt builds on stable artifacts rather than repeating the full assignment brief.

### 1. Persistent documentation as source of truth

| Artifact | Role in context |
|----------|-----------------|
| `requirements-analysis.md` | Scope, assumptions, edge cases |
| `acceptance-criteria.md` | Verifiable done conditions |
| `implementation-plan.md` | Phases, milestones, risks |
| `api-contract.md` | Endpoint shapes and validation rules |
| `design-notes.md` | Architecture and layer responsibilities |
| `data-model.md` | Tables, constraints, relationships |

These files are referenced in prompts (e.g. "Implement REST controllers per `api-contract.md`") so AI output stays aligned with agreed design.

### 2. In-editor context (@ references)

When implementing or debugging, specific files are attached to prompts:

- **Backend:** `TicketStatusTransitionValidator.java`, `TicketService.java`, `GlobalExceptionHandler.java`
- **Frontend:** `TicketDetailPage.tsx`, `axiosClient.ts`, `types/index.ts`
- **Config:** `application.yml`, `schema.sql`, `CorsConfig.java`

This grounds generation in actual code instead of hallucinated APIs.

### 3. Scoped session prompts

Large work is split into focused sessions (archived in `ai-prompts/`):

- `cursor_domain_layer_implementation.md`
- `cursor_ticket_status_transition_tasks.md`
- `cursor_rest_api_implementation_tasks.md`
- `cursor_integration_tests_implementation.md`
- `cursor_frontend_scaffold_implementation.md`
- `cursor_frontend_pages_implementation.md`

Each session targets one phase so context stays narrow and reviewable.

### 4. Symptom-led debugging context

For bugs, prompts include the observable symptom, not just "fix this":

- Error message or HTTP status (e.g. `LazyInitializationException`, `500` on `GET /api/tickets/{id}`)
- Stack trace excerpt
- What was already checked (CORS config, port 8080, PostgreSQL running)

### 5. Workspace rules and constraints

Explicit out-of-scope boundaries are stated in prompts and docs to prevent scope creep:

- No authentication, Docker Compose, or audit trail unless required
- Backend owns status transitions; frontend uses `allowedNextStatuses` from the API
- Minimal dependencies (no MapStruct, React Query, Testcontainers unless justified)

---

## How I Use AI for Requirement Analysis

AI accelerates the **first draft** of requirements; the developer owns scope decisions.

### Process

1. **Paste or summarize the assignment brief** and ask Cursor to draft `requirements-analysis.md` with fixed sections: understanding, functional/non-functional requirements, assumptions, clarifications, edge cases.
2. **Review and edit** the draft — especially the status workflow matrix, API surface, and what is explicitly out of scope.
3. **Generate `acceptance-criteria.md`** as checkboxes derived from the requirements doc so every requirement has a verifiable test condition.
4. **Log open questions** for a product owner (e.g. role-based access, reopening closed tickets) rather than implementing guessed behavior.

### What AI contributed

- Structured breakdown of ticket CRUD, comments, users, and pagination
- Status transition table (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`, with cancellation paths)
- Edge cases: invalid transitions, terminal statuses, same-status updates, concurrent last-write-wins
- Non-functional requirements: backend as source of truth, PostgreSQL constraints, Swagger, CORS

### Human responsibility

- Confirm the status machine matches the assignment exactly
- Reject over-scoped suggestions (auth, notifications, multi-tenancy)
- Decide which clarifications block delivery vs. can be deferred

---

## How I Use AI for Planning and Design

Planning and design are **document-first** — AI drafts artifacts; the developer approves before code generation.

### Planning (`implementation-plan.md`)

| Step | AI role | Human role |
|------|---------|------------|
| Phase breakdown | Backend-first phases (schema → API → tests → frontend) | Adjust timeline and milestones |
| Task lists | Checkbox tasks per phase | Mark dependencies and priorities |
| AI usage plan | Table mapping activities to AI vs human responsibility | Commit to validation gates |
| Risks & mitigation | Identify JPA, CORS, hard-coded UI transitions | Add project-specific risks (local PostgreSQL) |

### Design (`design-notes.md`, `data-model.md`, `api-contract.md`)

AI generated design docs **from requirements and emerging code**:

- **Architecture:** Three-tier diagram (React → Spring Boot → PostgreSQL); layer responsibilities
- **API contract:** Per-endpoint request/response JSON, validation rules, error shapes — grounded in controllers and DTOs
- **Database:** ER model, table definitions, indexes, seed strategy
- **Critical decisions:** `PUT` for metadata vs `PATCH /status` for state machine; `allowedNextStatuses` on every ticket response

### Design rules enforced throughout

- Business rules live in `TicketStatusTransitionValidator` — not in the frontend
- Validation at DTO, service, and database layers
- `open-in-view: false` with explicit `JOIN FETCH` where needed

---

## How I Use AI for Code Generation

Code generation follows **backend-first, small batches, review every diff**.

### Backend (phased)

| Phase | AI generated | Review focus |
|-------|--------------|--------------|
| Scaffold | Gradle project, `application.yml`, CORS, OpenAPI | Package structure, Java 21, profile setup |
| Domain | JPA entities, enums, repositories, `schema.sql`, `data.sql` | FK constraints, enum values, seed idempotency |
| Business logic | `TicketStatusTransitionValidator`, `TicketService` | Transition matrix matches requirements |
| API layer | DTOs, controllers, mappers, `GlobalExceptionHandler` | `PUT` vs `PATCH /status` split, error HTTP codes |
| Tests | Unit, service, integration tests | Mockito void stubbing, DB assertions on rejected transitions |

### Frontend (after API is stable)

| Phase | AI generated | Review focus |
|-------|--------------|--------------|
| Scaffold | Vite app, routing, Axios client, TypeScript types | Types mirror API DTOs |
| Pages | List, create, detail, edit | Status buttons from `allowedNextStatuses` only |
| Utilities | `statusUtils`, `errorUtils`, `useDebounce`, snackbar | Display helpers only — no business rules |

### Prompt patterns that worked

| Pattern | Example |
|---------|---------|
| **Template + fill** | "Create `api-contract.md` from backend controllers and DTOs" |
| **Scoped implementation** | "Implement frontend-pages todo only — list, detail, create, edit" |
| **One UX change** | "Make create ticket page center aligned" |
| **Follow existing patterns** | "Add GlobalExceptionHandler matching existing ErrorResponse shape" |

### What I reject or correct

- Hard-coded status buttons in the frontend
- Re-enabling `open-in-view: true` instead of fixing fetch queries
- New dependencies (MapStruct, React Query) without clear payoff
- Auth, Docker, audit trail when not in scope

---

## How I Validate AI-Generated Code

No AI output is accepted without at least one automated or manual check.

### Automated checks

| Check | Command | When |
|-------|---------|------|
| Backend compile & package | `.\gradlew.bat build` | After every major backend change |
| Backend tests | `.\gradlew.bat test` | After validator, service, or integration changes |
| Frontend build | `npm run build` | After page or type changes |

### Test-focused validation

- **Unit:** `TicketStatusTransitionValidatorTest` — every allowed and disallowed transition
- **Service:** `TicketServiceTest` — validate → persist; invalid transition does not call `save()`
- **Integration:** `TicketStatusTransitionIntegrationTest` — HTTP → DB; rejected transitions leave DB unchanged

### Manual validation

| Check | How |
|-------|-----|
| API contract | Swagger UI (`/swagger-ui.html`) — create, update, status patch, comments |
| Error paths | Blank title → `400` with field errors; `OPEN` → `CLOSED` → `400` with message |
| E2E lifecycle | Browser: create → `IN_PROGRESS` → `RESOLVED` → `CLOSED`; only valid buttons shown |
| Operational | Both backend (`bootRun`) and frontend (`npm run dev`) running |
| Doc accuracy | Cross-check `api-contract.md` and `acceptance-criteria.md` against actual code |

### Known AI failure modes (caught by validation)

| Issue | How caught |
|-------|------------|
| `LazyInitializationException` with `open-in-view: false` | `500` on ticket detail in Swagger |
| Mockito `when().thenThrow()` on void methods | Test compile/run failure |
| Empty `schema.sql` / `data.sql` | Backend startup error |
| Smoke test wiring real DB | `./gradlew build` without PostgreSQL |

---

## How I Use AI for Testing

AI is used to **scaffold tests from requirements**, not to replace judgment on what must be covered.

### Test generation workflow

1. **Point AI at the status transition matrix** in `requirements-analysis.md` and `acceptance-criteria.md`.
2. **Request layered tests:**
   - Unit: `TicketStatusTransitionValidatorTest` (pure transition logic)
   - Service: `TicketServiceTest` with mocked repositories (orchestration)
   - Integration: MockMvc + live PostgreSQL (full HTTP → DB path)
3. **Specify assertions explicitly:** invalid transition returns `400`; `ticket.status` in DB unchanged after rejected request.
4. **Run `./gradlew test`** and fix AI mistakes (e.g. Mockito void stubbing → `doThrow().when(...)`).

### AI strengths in testing

- Generating the full transition matrix (valid + invalid cases) quickly
- MockMvc request/response boilerplate and JSON path assertions
- DB state queries after transitions (`assertThat(ticket.getStatus()).isEqualTo(...)`)

### Human responsibilities

- Decide test pyramid balance (heavy on integration for the state machine)
- Fix framework API misuse (Mockito, Spring test profiles)
- Document gaps in `test-strategy.md` (E2E browser tests, partial PUT/list coverage)
- Defer Testcontainers unless CI requirements justify the dependency

### Frontend testing

Frontend component tests use **Vitest + React Testing Library** (9 files, 35 tests). AI scaffolded test files for pages and utilities with mocked API modules. Key coverage: `TicketDetailPage` renders status buttons only from `allowedNextStatuses`. Manual E2E in the browser still supplements automated tests for full lifecycle flows with a live backend.

---

## How I Use AI for Debugging

Debugging prompts are **symptom-first**; AI investigates before suggesting code changes.

### Workflow (documented in `debugging-notes.md`)

```
Problem → Investigate → AI assistance → Validate fix → Record in debugging-notes.md
```

### Examples from this project

| Issue | AI role | Outcome |
|-------|---------|---------|
| "Unable to reach server" on all API calls | Checked port 8080, terminal state, suggested starting `bootRun` | No code change — operational fix |
| PostgreSQL auth failure + empty SQL scripts | Parsed stack trace; suggested no-op SQL and env-based credentials | Config and SQL init fixes |
| `LazyInitializationException` on ticket detail | Explained `open-in-view: false` + lazy fetch; generated `JOIN FETCH` query | Repository and service update |
| Mockito void stubbing failure | Identified `when().thenThrow()` vs `doThrow().when()` | Test fix |

### What makes debugging prompts effective

- Include the **exact error message** or HTTP status
- State **what already was ruled out** (e.g. CORS is configured)
- Ask AI to **reproduce** via terminal commands or Swagger before editing code
- Require **re-run of tests** after any fix

### Human responsibility

- Confirm root cause locally (don't accept the first suggestion blindly)
- Distinguish code bugs from operational issues (backend not running)
- Log each issue in `debugging-notes.md` for reviewers and future reference

---

## How I Use AI for Code Review

AI-assisted review compares the codebase against `acceptance-criteria.md`, architecture principles, and common framework pitfalls. Findings are logged in `code-review-notes.md`.

### Review prompt approach

Ask Cursor to review against:

- Assignment requirements and acceptance criteria
- Backend-as-source-of-truth for status transitions
- JPA fetch strategy with `open-in-view: false`
- Error handling consistency (`GlobalExceptionHandler` + frontend `errorUtils`)
- Test coverage gaps
- Security and operational concerns (expected for scope)

### Review output format

| Category | Examples |
|----------|----------|
| **Pass** | Status machine centralized; `PUT` vs `PATCH /status` split; API-driven UI buttons |
| **High** | Lazy-load risk on detail endpoints — fixed with `findByIdWithUsers` |
| **Medium** | No E2E browser tests; integration tests require local PostgreSQL |
| **Low** | Duplicate UI controls, redundant Refresh button |

### Post-review actions

- **Accepted fixes:** JOIN FETCH, Mockito stubbing, smoke test DataSource exclusion, UX polish
- **Rejected suggestions:** Re-enable OSIV, hard-code transitions, add auth/Docker/MapStruct/React Query — with documented rationale

### Human role in review

AI review is a **first pass**. The developer still reads critical paths (validator, service, detail page) and decides what to accept, defer, or reject.

---

## What Information I Avoid Sharing Unnecessarily with AI Tools

Minimize sensitive and irrelevant data in prompts and exported chat logs.

### Do not share

| Category | Examples | Safer alternative |
|----------|----------|-------------------|
| **Secrets & credentials** | Production DB passwords, API keys, JWT secrets, private keys | Use placeholders (`<DB_PASSWORD>`); reference env var names only |
| **Real PII** | Customer emails, names, account IDs from production | Use seeded/fake data from `data.sql` |
| **Production URLs & infra** | Internal hostnames, VPN endpoints, cloud account IDs | Describe environment generically ("local PostgreSQL on 5432") |
| **Proprietary business logic** | Unrelated company algorithms, pricing rules, unreleased features | Scope prompts to the ticket system only |
| **Full production logs** | Logs containing tokens, session IDs, user data | Share redacted stack traces or error messages only |
| **Third-party credentials** | OAuth client secrets, webhook signing keys | Never paste; rotate if accidentally exposed |

### Acceptable to share for this project

- Assignment requirements and public-style API contracts
- Local dev defaults documented in README (with a note to override via env vars)
- Redacted stack traces and test failure output
- Architecture and design docs created for the assessment

### Practices

- Prefer **environment variables** (`SPRING_DATASOURCE_*`) over pasting passwords into chat
- **Redact** before exporting prompts to `ai-prompts/`
- Treat AI chat as **semi-public** — don't paste anything you wouldn't put in a code review comment

---

## How I Would Reuse This Workflow in a Real Project

This assessment workflow maps directly to a team delivery model with minor additions for collaboration and CI.

### Reusable lifecycle

```
1. Requirements doc      →  requirements-analysis.md
2. Acceptance criteria   →  acceptance-criteria.md (checkboxes)
3. Implementation plan   →  phased breakdown + milestones + AI usage plan
4. Design artifacts      →  design-notes.md, api-contract.md, data-model.md
5. Backend-first build   →  schema → domain → validator → API → tests
6. Frontend against API  →  types mirror DTOs; no business logic in UI
7. Validate continuously →  build + test + Swagger + E2E after each batch
8. Debug log             →  debugging-notes.md
9. Code review           →  code-review-notes.md (accepted vs rejected)
10. Retrospective        →  reflection.md, final-ai-usage-summary.md
```

### Adaptations for a real team

| Assessment practice | Production adaptation |
|---------------------|----------------------|
| Single developer + Cursor | Shared Cursor rules (`.cursor/rules/`), PR templates, mandatory human review on AI diffs |
| Local PostgreSQL for tests | Testcontainers in CI; secrets via vault or CI env vars |
| Manual frontend testing | Vitest + RTL scaffolded by AI; Playwright for critical flows |
| `ai-prompts/` archive | Team knowledge base or ADRs for major AI-assisted decisions |
| `acceptance-criteria.md` | Linked to Jira/Linear tickets; Definition of Done in sprint process |

### Team rules to carry forward

1. **Backend owns business rules** — API exposes allowed actions; UI never duplicates state machines.
2. **Document before generate** — requirements and API contract before bulk code generation.
3. **Small, scoped AI sessions** — one phase per prompt; review diff before next phase.
4. **Test the risky parts first** — state machine, payments, auth — before UI polish.
5. **Log AI mistakes** — debugging notes and rejected suggestions prevent repeat errors.
6. **No blind acceptance** — build, test, or smoke test every AI change.
7. **Minimal dependencies** — reject AI suggestions for new libraries unless justified.

### Prompt templates to reuse

```
"Draft [artifact].md with sections: [list]. Base it on [requirements-analysis.md]."
"Implement [layer] per api-contract.md. Follow existing patterns in [file]."
"Add integration tests for [feature]. Assert DB state on failure paths."
"Debug: [symptom]. Stack trace: [excerpt]. Already checked: [list]."
"Review against acceptance-criteria.md. Log findings in code-review-notes.md."
```

### One-line takeaway

> Use AI to go fast on structure and docs; use tests, review, and manual E2E to stay correct on business rules.

---

## Related Artifacts

| Document | Purpose |
|----------|---------|
| `implementation-plan.md` | AI usage plan by phase |
| `final-ai-usage-summary.md` | Consolidated AI usage record |
| `reflection.md` | Lifecycle retrospective |
| `debugging-notes.md` | Issue investigation log |
| `code-review-notes.md` | Review findings and rejected suggestions |
| `ai-prompts/` | Exported Cursor conversation sessions |
| `test-strategy.md` | Test scope, pyramid, and gaps |
