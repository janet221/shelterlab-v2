# 18 API Specification

The existing Next.js route-handler surface remains the architectural baseline. Runtime demo authentication uses `x-test-code` and must be replaced before field deployment.

## Current Route Inventory

| Domain | Current route groups | Primary authorized actors | Persistence note |
|---|---|---|---|
| Government data | `GET /api/open-data/datasets`, `GET /api/open-data/datasets/[id]/preview`, `PATCH /api/admin/datasets/[id]`, `POST /api/admin/datasets/[id]/sync` | Teacher/admin read preview; admin mutation/sync | Prisma-backed admin sync; verified fixtures in demo |
| Curriculum resources | `/api/curriculum/resources`, import/import-preview, resource verify/review/reject/unavailable, `/api/curriculum/mappings`, evidence graph/traceability | Teacher/admin; student approved-resource reads through student routes | Domain/demo state plus persistent mutation audit |
| Question authoring | `/api/question-authoring/blueprints*`, `/api/question-authoring/drafts*`, `/api/teacher/questions*` | Authorized teacher/admin | Mixed demo state and persistent audit |
| Question generation | `/api/question-generation/providers`, `/generate`, `/quality` | Teacher/admin | Deterministic/mock/disabled external provider |
| Research License | `/api/research-license/modules*`, `/attempts*`, answers, submit, remediation, license, admin revoke | Student own attempt/license; teacher scoped views; admin revoke | Domain/demo runtime with Prisma schema |
| Observation | Existing `/api/observations/*` plus `/api/living-lab/missions*`, session/event/review/publication, dog timeline/profile and admin routes | Student/teacher/shelter/admin by workflow and scope | Sprint 7 domain/demo runtime with persistent mutation audit; production repository required |
| Student resources | `/api/student/resources`, assignments, progress, remediation | Student own; teacher/admin assignment scope | Demo/runtime limitations |
| Competition evidence | `/api/competition/evidence`, `/api/competition/impact`, `/api/competition/demo`, `/api/curriculum/evidence-graph` | Public judge read-only | Deterministic evidence graph, impact snapshot, scorecard and zero-mutation demo manifest |

Exact route availability is defined by the repository's `app/api` tree and build output. This table is the V1.0 grouping baseline, not a promise that future adoption/GIS/media APIs already exist.

### API-001 API contract and validation

- **Description:** Every route/server action shall validate path, query, headers, and body with typed schemas and return stable success/error shapes.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a client developer, I want predictable contracts so that UI workflows handle errors safely.
- **Acceptance criteria:** Zod rejects malformed input; errors avoid sensitive detail; status codes distinguish auth, validation, conflict, not found, and server failure.
- **Related modules:** Next.js Route Handlers, Zod, Domain Services
- **Competition value:** Technical quality.
- **Government-data dependency:** Adapter preview/sync returns provenance and flags.
- **AI dependency:** Provider output is schema-validated.
- **Evidence chain dependency:** IDs/versions are explicit in responses.

### API-002 Authorization and concurrency

- **Description:** Mutating APIs shall recheck role, organization/course/shelter ownership, current workflow state, and expected version on the server.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As an authorized user, I want conflicting or out-of-scope changes rejected so that records remain trustworthy.
- **Acceptance criteria:** UI state cannot bypass authorization; stale writes return conflict; published/submitted immutable state rejects mutation; audit and state commit transactionally.
- **Related modules:** Auth, Workflow, Repositories, Audit
- **Competition value:** Security and integrity.
- **Government-data dependency:** Sync is admin-only.
- **AI dependency:** AI actors have no authority token.
- **Evidence chain dependency:** Actor/version required.

### API-003 Core endpoint groups

- **Description:** The API shall maintain grouped contracts for curriculum/resources, question authoring/generation, Research License, observations/reviews, open data/admin sync, student resources, and competition evidence.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As an engineer, I want coherent domain endpoints so that modules can evolve without architectural redesign.
- **Acceptance criteria:** Existing route groups remain backward compatible or versioned; documentation lists method/path/role/input/output/state effects; tests cover critical mutations.
- **Related modules:** `/api/curriculum`, `/api/question-*`, `/api/research-license`, `/api/observations`, `/api/open-data`, `/api/admin`, `/api/competition`
- **Competition value:** Demonstrable system completeness.
- **Government-data dependency:** Open-data routes required.
- **AI dependency:** Question-generation routes use provider boundary.
- **Evidence chain dependency:** Evidence graph endpoints expose lineage.

### API-004 External integration boundaries

- **Description:** Government, iLearn, AI, object storage, notifications, and GIS integrations shall be isolated behind adapters with timeout, retry, health, policy, and fallback behavior.
- **Priority:** Should
- **Delivery state:** Partial
- **User story:** As operator, I want external failures contained so that core workflows remain safe.
- **Acceptance criteria:** No external service writes authoritative state directly; retries are idempotent; health/freshness is observable; credentials never enter client responses.
- **Related modules:** Adapter Interfaces, Jobs, Observability
- **Competition value:** Resilient architecture.
- **Government-data dependency:** Required for live sync.
- **AI dependency:** Required for real provider.
- **Evidence chain dependency:** External request/result provenance retained.

### API-005 API inventory baseline

- **Description:** The maintained API reference shall enumerate implemented routes and flag demo-store, database-backed, and future contracts.
- **Priority:** Should
- **Delivery state:** Missing as consolidated reference
- **User story:** As contributor, I want one API inventory so that I can distinguish working endpoints from blueprint scope.
- **Acceptance criteria:** Inventory is generated or reviewed per release; authorization and persistence mode are shown; stale routes are identified.
- **Related modules:** Documentation, Testing, Route Handlers
- **Competition value:** Engineering clarity.
- **Government-data dependency:** Dataset routes included.
- **AI dependency:** Provider routes included.
- **Evidence chain dependency:** Trace endpoints included.
