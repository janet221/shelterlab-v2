# 15 Dashboard

### DSH-001 Role-specific operational dashboards

- **Description:** Student, teacher, shelter, and admin dashboards shall prioritize current tasks, exceptions, review queues, and status rather than marketing content.
- **Priority:** Must
- **Delivery state:** Partial; Sprint 10A adds a synthetic shelter Adoption Readiness evidence-coverage view
- **User story:** As a user, I want the next required action visible so that repeated workflows are efficient.
- **Acceptance criteria:** Student shows license/tasks/remediation; teacher shows readiness/reviews; shelter shows confirmations/dog history; admin shows datasets/audit/operations; backend scope governs data.
- **Related modules:** Student, Teacher, Shelter, Admin Dashboards
- **Competition value:** Product completeness and usability.
- **Government-data dependency:** Admin/teacher show source states and freshness.
- **AI dependency:** AI queue/status visible where relevant.
- **Evidence chain dependency:** Dashboard links to underlying records.

### DSH-002 Competition evidence dashboard

- **Description:** The judge dashboard shall distinguish verified official provenance from synthetic impact metrics and explain how each activated dataset changes a product function.
- **Priority:** Must
- **Delivery state:** Implemented demo; Sprint 8 adds formula-level impact and score-mapping views
- **User story:** As a judge, I want exact provenance and product use in one view so that open-data value is immediately verifiable.
- **Acceptance criteria:** Shows exact title/agency/ID/source, retrieval/snapshot/sync, fields, transformation, feature, educational outcome, evidence, verification, attribution, license, and display mode.
- **Related modules:** Competition Dashboard, Open Data, Evidence Chain
- **Competition value:** Direct judging evidence.
- **Government-data dependency:** Required: 6318, 40121, 41236.
- **AI dependency:** Shows governance evidence but operates without AI.
- **Evidence chain dependency:** Required.

### DSH-003 Dashboard truth and privacy

- **Description:** Dashboards shall display metric definitions, date range, numerator/denominator, freshness, evidence mode, and privacy suppression where applicable.
- **Priority:** Must
- **Delivery state:** Implemented for Sprint 8 synthetic competition metrics; real privacy suppression pending
- **User story:** As a stakeholder, I want context around every number so that I do not misinterpret it.
- **Acceptance criteria:** No unsourced metric; no small-cell or individual ranking in public views; empty/zero states are differentiated; causal claims require approved design.
- **Related modules:** Analytics, Privacy, Dashboard Components
- **Competition value:** Trust and data literacy.
- **Government-data dependency:** Source/freshness visible.
- **AI dependency:** AI commentary cannot hide metric definition.
- **Evidence chain dependency:** Metric links to definition and source evidence.

### DSH-004 Drill-down and export controls

- **Description:** Authorized users should drill from aggregate metrics into permitted evidence, while exports remain scoped, audited, and privacy-filtered.
- **Priority:** Should
- **Delivery state:** Planned
- **User story:** As a program owner, I want to investigate anomalies without exposing restricted data.
- **Acceptance criteria:** Role/scope rechecked on drill-down/export; export purpose and actor audited; public users cannot access row-level student/adopter data.
- **Related modules:** Analytics API, Export, Audit
- **Competition value:** Operational and policy usefulness.
- **Government-data dependency:** Attribution travels with exports.
- **AI dependency:** None.
- **Evidence chain dependency:** Export records source/version.
