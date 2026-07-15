# 16 Analytics

### ANL-001 Versioned metric contract

- **Description:** Every KPI shall define owner, purpose, formula, numerator, denominator, dimensions, source entities, exclusions, freshness, privacy threshold, and interpretation limits.
- **Priority:** Must
- **Delivery state:** Implemented schema/domain for deterministic Sprint 8 metrics; durable runs pending
- **User story:** As Data/Impact Owner, I want versioned definitions so that dashboards remain reproducible.
- **Acceptance criteria:** Metric version is stored with results; definition changes do not rewrite historical values; zero denominator is handled explicitly.
- **Related modules:** Analytics Registry, Dashboard, Audit
- **Competition value:** Scientific and technical rigor.
- **Government-data dependency:** Contextual sources and snapshot versions recorded.
- **AI dependency:** Analytics assistant consumes definitions, not raw guesses.
- **Evidence chain dependency:** Metric definition and source records required.

### ANL-002 Education analytics

- **Description:** Education analytics shall cover participation, module outcomes, license readiness, competency coverage, remediation, inquiry rubric, and observation data quality.
- **Priority:** Must
- **Delivery state:** Implemented synthetic demo with paired learning gain and license completion
- **User story:** As a teacher/program owner, I want learning evidence so that program value and weak areas are visible.
- **Acceptance criteria:** Class/school scope and privacy suppression apply; synthetic/pilot/production modes are separate; no student ranking in public views.
- **Related modules:** Research License, Learning Evidence, Teacher Dashboard
- **Competition value:** Educational impact.
- **Government-data dependency:** 40121 may contextualize reach but not imply participation.
- **AI dependency:** Optional interpretation only.
- **Evidence chain dependency:** Results resolve to attempts/rubrics.

### ANL-003 Shelter and adoption analytics

- **Description:** Shelter analytics shall cover review throughput, evidence coverage, profile completeness, waiting time, program progression, follow-up, and adoption retention with limitations.
- **Priority:** Should
- **Delivery state:** Partial synthetic demo for observation/profile readiness; adoption outcomes remain planned
- **User story:** As shelter management, I want aggregate operational evidence so that bottlenecks and support needs are visible.
- **Acceptance criteria:** Individual staff/adopter rankings prohibited; cohort/time definitions explicit; 41236 comparisons remain contextual and not causal performance scores.
- **Related modules:** Observation, Adoption Accelerator, Shelter Dashboard
- **Competition value:** Social and operational impact.
- **Government-data dependency:** 41236 aggregate context.
- **AI dependency:** Optional summary assistant.
- **Evidence chain dependency:** Published evidence and outcomes feed aggregates.

### ANL-004 GIS and spatial inquiry

- **Description:** A GIS pilot may visualize generalized shelter/environment variables and observation coverage without exposing sensitive animal/student locations.
- **Priority:** Could
- **Delivery state:** Planned
- **User story:** As a student or policy viewer, I want spatial patterns so that urban-ecology questions can be explored.
- **Acceptance criteria:** Official boundaries/sources are verified; coordinates are generalized/suppressed; map legends disclose time/source; no kennel or student path is public.
- **Related modules:** GIS, One Health Inquiry, Privacy
- **Competition value:** High-visual innovation.
- **Government-data dependency:** Verified boundary/environment sources required.
- **AI dependency:** None.
- **Evidence chain dependency:** Layer version/source links required.

### ANL-005 AI and data-quality analytics

- **Description:** The platform shall measure source verification, mapping coverage, AI draft acceptance/rejection/revision, source alignment, unsafe blocks, duplicate/validation flags, and reviewer workload.
- **Priority:** Should
- **Delivery state:** Implemented deterministic observation/source quality metrics; real AI metrics remain disabled
- **User story:** As governance owner, I want quality metrics so that automation and evidence processes can be improved safely.
- **Acceptance criteria:** Provider/version and reviewer scope are preserved; metrics do not reward unsafe auto-approval; thresholds are versioned.
- **Related modules:** AI Governance, Open Data, Observation Validation, Audit
- **Competition value:** Responsible-AI and data-quality proof.
- **Government-data dependency:** Dataset validation metrics.
- **AI dependency:** Required for AI metrics only.
- **Evidence chain dependency:** Audit/sync/review events are sources.
