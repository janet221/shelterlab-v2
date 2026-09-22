# 06 Government Open Data

Verified official sources are documented in `OFFICIAL_DATASET_VERIFICATION_REPORT.md`. Runtime competition use is a deterministic verified fixture, not disguised live synchronization.

### OGD-001 Verification gate

- **Description:** A dataset shall be `VERIFIED` only after official metadata and at least one actual official resource pass access, encoding, schema, license, and provenance validation.
- **Priority:** Must
- **Delivery state:** Implemented
- **User story:** As Data Steward, I want evidence-based source states so that official claims are defensible.
- **Acceptance criteria:** Verification stores official ID/title/agency/URL, endpoint, format, fields, cadence, update date, license, attribution, encoding, retrieval time, verifier, hash, intended use, and restrictions.
- **Related modules:** Dataset Registry, Adapters, Snapshots
- **Competition value:** Open-data credibility.
- **Government-data dependency:** Core dependency.
- **AI dependency:** Verified state constrains question sources.
- **Evidence chain dependency:** Dataset and snapshot are root nodes.

### OGD-002 Activated official workflows

- **Description:** Datasets `6318`, `40121`, and `41236` shall remain activated only while each drives its approved curriculum, question-context, or inquiry workflow.
- **Priority:** Must
- **Delivery state:** Implemented as verified fixtures
- **User story:** As a judge, I want open data to change product behavior so that utilization is substantive.
- **Acceptance criteria:** 6318 maps to optional metadata/outbound resource discovery; 40121 maps to education data-literacy/question blueprint; 41236 maps to aggregate shelter comparison/inquiry; usage records are traceable.
- **Related modules:** Curriculum Resources, Question Blueprint, Inquiry Dashboard
- **Competition value:** Direct EDUOD scoring evidence.
- **Government-data dependency:** Required: 6318, 40121, 41236.
- **AI dependency:** 40121/41236 may ground drafts but do not require AI.
- **Evidence chain dependency:** Usage resolves to snapshot and product entity.

### OGD-003 Source-specific restrictions

- **Description:** 6318 shall remain metadata/outbound-link only; 29027 shall not supply question content; 41236 shall remain county-month aggregate context.
- **Priority:** Must
- **Delivery state:** Implemented
- **User story:** As Data Steward, I want source-specific policy enforced so that legal and scientific boundaries are not lost during reuse.
- **Acceptance criteria:** 6318 contains no video/transcript; 29027 contains no assumed question/answer fields and is disabled for assessment; 41236 schemas reject individual-dog fields.
- **Related modules:** Dataset Adapters, Curriculum, Question Generation, Analytics
- **Competition value:** Responsible open-data innovation.
- **Government-data dependency:** Required.
- **AI dependency:** AI inputs inherit restrictions.
- **Evidence chain dependency:** Restrictions attach to source provenance.

### OGD-004 Synchronization integrity

- **Description:** Dataset sync shall validate with Zod, normalize records, hash content with SHA-256, skip duplicates, record sync runs, and preserve the last success after failure.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As admin, I want reliable imports so that a source outage cannot erase working evidence.
- **Acceptance criteria:** Duplicate sync is `SKIPPED` without degrading status; failed sync retains prior snapshot; attribution is attached to normalized rows; Sync Now is admin-only.
- **Related modules:** Adapters, Admin API, Prisma Dataset Models, Audit
- **Competition value:** Technical quality and reproducibility.
- **Government-data dependency:** Required.
- **AI dependency:** None.
- **Evidence chain dependency:** Snapshot versions and sync runs are evidence.

### OGD-005 Production schedule and freshness

- **Description:** Production shall synchronize approved datasets daily at 02:00 by default, expose freshness, and support admin Sync Now without replacing successful data on failure.
- **Priority:** Should
- **Delivery state:** Production required
- **User story:** As admin, I want automated and manual synchronization so that users know how current evidence is.
- **Acceptance criteria:** Scheduler is monitored; source-specific cadence may override default; last attempt/success/error and display mode are visible; credentials are externalized.
- **Related modules:** Job Queue, Admin Dashboard, Observability
- **Competition value:** Operational feasibility.
- **Government-data dependency:** Required.
- **AI dependency:** None.
- **Evidence chain dependency:** Freshness metadata attaches to snapshots.
