# 23 Testing

### TST-001 Layered automated testing

- **Description:** Domain rules shall have unit tests; repositories/routes shall have integration tests; critical role journeys shall have Playwright coverage.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As engineer, I want risk-scaled tests so that completed behavior remains stable.
- **Acceptance criteria:** Workflow, scoring, authorization, validation, adapter, audit, and privacy boundaries are covered; regressions block release.
- **Related modules:** Vitest, Playwright, Test Data
- **Competition value:** Technical quality.
- **Government-data dependency:** Adapter/fixture/provenance tests required.
- **AI dependency:** Provider/quality/governance tests required.
- **Evidence chain dependency:** Chain completeness/integrity tests required.

### TST-002 Current baseline preservation

- **Description:** Product Specification V1.0 shall treat the Sprint 6.1 baseline of 110 unit and 9 Playwright passing tests as the minimum regression floor until superseded.
- **Priority:** Must
- **Delivery state:** Implemented baseline
- **User story:** As Product Owner, I want completed Sprint 1-6.1 behavior preserved so that future work does not erase competition evidence.
- **Acceptance criteria:** CI runs lint/typecheck/unit/build/e2e; intentional changes update requirements/tests/reports together; flaky tests are fixed, not ignored.
- **Related modules:** CI, All Implemented Domains
- **Competition value:** Delivery confidence.
- **Government-data dependency:** Includes 12 Sprint 6.1 source tests.
- **AI dependency:** Includes deterministic provider governance tests.
- **Evidence chain dependency:** Includes traceability tests.

### TST-003 Database and migration integration

- **Description:** CI/staging shall run migrations, idempotent seed, transactional API integration, audit rollback, and last-success sync behavior against PostgreSQL.
- **Priority:** Must
- **Delivery state:** Missing due local infrastructure
- **User story:** As engineer, I want real-database verification so that schema-only confidence is not mistaken for runtime proof.
- **Acceptance criteria:** Ephemeral PostgreSQL is provisioned; migrations/seed run from clean state; concurrency/constraint/transaction tests pass; restore test is documented.
- **Related modules:** PostgreSQL, Prisma, API Integration
- **Competition value:** Closes a major technical risk.
- **Government-data dependency:** Snapshot/sync persistence tested.
- **AI dependency:** Draft/audit persistence tested.
- **Evidence chain dependency:** Transactional chain tested.

### TST-004 Security, privacy, accessibility, and performance

- **Description:** Production release shall add negative authorization, privacy leakage, upload, dependency, accessibility, load, and recovery tests.
- **Priority:** Must
- **Delivery state:** Missing
- **User story:** As release owner, I want non-functional controls tested so that functional demos do not mask deployment risks.
- **Acceptance criteria:** Approved thresholds and test suites exist; high-severity failures block release; results are retained as evidence.
- **Related modules:** Security, Privacy, Accessibility, Performance, Recovery
- **Competition value:** Production readiness.
- **Government-data dependency:** Sync/load/failure tests.
- **AI dependency:** Abuse/privacy/evaluation tests.
- **Evidence chain dependency:** Integrity under failure tested.

### TST-005 Demo rehearsal testing

- **Description:** The seven-minute demo shall be rehearsed on target hardware/network with reset, offline, and recorded fallbacks.
- **Priority:** Must
- **Delivery state:** Planned
- **User story:** As Demo Lead, I want timed evidence of reliability so that presentation execution is predictable.
- **Acceptance criteria:** Multiple timed runs meet 420 seconds; each failure fallback is exercised; screenshots/video match current build and labels.
- **Related modules:** Competition Demo, Release Candidate
- **Competition value:** Presentation reliability.
- **Government-data dependency:** Verified fixture tested offline.
- **AI dependency:** Deterministic fallback tested.
- **Evidence chain dependency:** Complete chain tested in demo order.

### TST-006 Public experience regression

- **Description:** The public landing, guided tour, demo perspectives, reset, Judge Mode, trust pages, discovery metadata, 404, and responsive widths shall have automated regression coverage.
- **Priority:** Must
- **Delivery state:** Implemented in Sprint 11C
- **User story:** As a Demo Lead, I want public journeys protected so that presentation polish does not break evidence access.
- **Acceptance criteria:** Unit tests verify deterministic manifests; Playwright covers public journeys and 390/768/1440/1920 widths; existing tests remain passing.
- **Related modules:** Public Site, Public Demo, Judge Mode, SEO
- **Competition value:** Reliability and presentation quality.
- **Government-data dependency:** Existing source-label tests remain passing.
- **AI dependency:** Existing deterministic/no-provider boundaries remain passing.
- **Evidence chain dependency:** Public links reach implemented trace projections.
