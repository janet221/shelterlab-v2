# 05 Non-functional Requirements

### NFR-001 Maintainable approved stack

- **Description:** ShelterLab shall retain Next.js, TypeScript, PostgreSQL, Prisma, Tailwind, Zod, Vitest, Playwright, and Docker Compose unless an architectural decision approves a replacement.
- **Priority:** Must
- **Delivery state:** Implemented
- **User story:** As a student engineering team, I want a familiar deployable stack so that the product remains maintainable.
- **Acceptance criteria:** New modules follow existing boundaries; alternatives are justified in architecture documentation before adoption.
- **Related modules:** All engineering modules
- **Competition value:** Feasibility and maintainability.
- **Government-data dependency:** Adapters use TypeScript/Zod boundaries.
- **AI dependency:** Providers use typed interfaces.
- **Evidence chain dependency:** Persistence uses existing Prisma/audit model.

### NFR-002 Deterministic offline demonstration

- **Description:** Competition-critical journeys shall have labeled, reproducible offline fixtures and deterministic fallbacks.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As Demo Lead, I want the story to survive network/provider failure so that presentation risk is controlled.
- **Acceptance criteria:** Verified fixtures retain official provenance; synthetic data is unmistakable; reset instructions reproduce the same journey.
- **Related modules:** Competition Demo, Open Data, AI, Seed
- **Competition value:** Presentation reliability.
- **Government-data dependency:** Verified snapshots provide offline data.
- **AI dependency:** Deterministic/manual fallback required.
- **Evidence chain dependency:** Fixture chain remains complete.

### NFR-003 Accessibility and responsive operation

- **Description:** Core journeys shall support keyboard use, readable contrast, responsive layouts, stable controls, and Traditional Chinese/English terminology governance.
- **Priority:** Should
- **Delivery state:** Partial
- **User story:** As a student or reviewer, I want an accessible interface across school devices so that I can complete tasks reliably.
- **Acceptance criteria:** WCAG-oriented checks cover core pages; text does not overlap; timers and status are not color-only; mobile and desktop Playwright smoke paths pass.
- **Related modules:** Frontend, Testing, Localization
- **Competition value:** Usability and inclusiveness.
- **Government-data dependency:** Source labels remain readable.
- **AI dependency:** AI status is conveyed textually.
- **Evidence chain dependency:** Status labels remain accessible.

### NFR-004 Performance and availability targets

- **Description:** Production shall define measurable page, API, job, and recovery targets appropriate to school and shelter operations.
- **Priority:** Should
- **Delivery state:** Missing
- **User story:** As an operator, I want explicit service targets so that reliability can be monitored.
- **Acceptance criteria:** Approved SLOs define p95 latency, job freshness, uptime, RPO/RTO, and alert thresholds; load tests validate critical routes.
- **Related modules:** Deployment, Observability, API, Jobs
- **Competition value:** Production credibility.
- **Government-data dependency:** Sync freshness SLO required.
- **AI dependency:** Provider timeout/fallback SLO required.
- **Evidence chain dependency:** Failed writes cannot create partial chain states.

### NFR-005 Data integrity and transactional authority

- **Description:** Authority-bearing mutations and their audit records shall commit transactionally in production.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As an auditor, I want state and audit to agree so that decisions cannot exist without evidence.
- **Acceptance criteria:** Audit failure rolls back mutation; version conflicts are detected; published and submitted snapshots remain immutable.
- **Related modules:** Prisma Repositories, Audit, Workflow Engines
- **Competition value:** Technical rigor and trust.
- **Government-data dependency:** Snapshot/sync-run state is atomic.
- **AI dependency:** AI metadata persists with generated drafts.
- **Evidence chain dependency:** Required.
