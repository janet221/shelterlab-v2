# 21 Competition Demo

### DEM-001 Seven-minute evidence story

- **Description:** The competition demo shall present problem/value, verified open data, teacher-governed question, Research License, Living Lab observation/review, adoption-support evidence, and impact dashboard within 420 seconds.
- **Priority:** Must
- **Delivery state:** Implemented in Sprint 11A with seven timed sections, stable deep links, and one-click guided product journey
- **User story:** As Demo Lead, I want one coherent story so that judges understand differentiation quickly.
- **Acceptance criteria:** Timed script assigns scene owner, action, proof, transition, and fallback; no unimplemented capability is performed as live.
- **Related modules:** Competition Script, All Demo Modules
- **Competition value:** Presentation score and narrative clarity.
- **Government-data dependency:** Official provenance appears early.
- **AI dependency:** Governed draft/fallback shown honestly.
- **Evidence chain dependency:** Story follows chain order.

### DEM-002 Demo truth labels

- **Description:** Every scene shall label `LIVE`, `CACHED_SNAPSHOT`, `VERIFIED_FIXTURE`, `SYNTHETIC_DEMO`, `DEMO_REFERENCE`, or `FUTURE` as appropriate.
- **Priority:** Must
- **Delivery state:** Implemented for Sprint 8 judge dashboard and Demo Mode
- **User story:** As a judge, I want to know what I am seeing so that evidence is not confused with claims.
- **Acceptance criteria:** Data mode visible on dashboard/handout; impact metrics remain synthetic until pilot; official curriculum demos are not marked verified.
- **Related modules:** Dashboard, Demo Dataset, Documentation
- **Competition value:** Credibility.
- **Government-data dependency:** Exact mode/source required.
- **AI dependency:** Deterministic/mock/external status visible.
- **Evidence chain dependency:** Each node includes state/version.

### DEM-003 Offline reset and failure playbook

- **Description:** The demo shall be reproducible from a clean reset and have pretested fallback for network, database, AI, media, and navigation failure.
- **Priority:** Must
- **Delivery state:** Partial; deterministic browser-local reset implemented in Sprint 11A, deployment and venue failure rehearsal pending
- **User story:** As presenter, I want controlled fallback so that technical failure does not destroy the evidence story.
- **Acceptance criteria:** Reset script/seed, verified fixtures, deterministic AI, screenshots/video, and narration are prepared; fallback never invents live state.
- **Related modules:** Seed, Deployment, Demo Assets
- **Competition value:** Reliability under judging conditions.
- **Government-data dependency:** Verified fixture required.
- **AI dependency:** Deterministic fallback required.
- **Evidence chain dependency:** Offline chain remains inspectable.

### DEM-005 Judge presentation control

- **Description:** Judge Mode shall provide seven stable sections, synchronized presentation links, a 420-second helper timer, and visible section progress without changing domain data.
- **Priority:** Must
- **Delivery state:** Implemented in Sprint 11A
- **User story:** As a presenter, I want one controlled surface so that I can demonstrate the implemented evidence journey within seven minutes.
- **Acceptance criteria:** Exactly seven sections total 420 seconds; the guided product route preserves the approved order; reset returns canonical `SYNTHETIC_DEMO` state; production mutation count remains zero.
- **Related modules:** Competition Experience, Research License, Living Lab, Adoption Profile, One Health Inquiry, Impact Intelligence
- **Competition value:** Narrative clarity, reliability, technical credibility, and inspectable evidence.
- **Government-data dependency:** Existing evidence pages retain their exact source and fixture labels.
- **AI dependency:** None; presentation behavior is deterministic.
- **Evidence chain dependency:** Each scene links to an implemented evidence projection.

### DEM-004 Competition eligibility package

- **Description:** Before submission, the team shall archive official category rules, deadlines, weights, source/license evidence, privacy/AI constraints, architecture, tests, and claim substantiation.
- **Priority:** Must
- **Delivery state:** Missing external verification
- **User story:** As Product Owner, I want an evidence package so that the submission is eligible and defensible.
- **Acceptance criteria:** Rules are dated/sourced; EDUOD eligibility is confirmed; claims map to tests/screens/evidence; unresolved risks have owner and fallback.
- **Related modules:** Documentation, InnoServe Mapping, Risk Register
- **Competition value:** Submission validity.
- **Government-data dependency:** Technical open-data basis documented.
- **AI dependency:** Competition AI rules documented.
- **Evidence chain dependency:** Evidence package includes chain proof.

### DEM-006 Public non-technical entry

- **Description:** A public visitor shall understand ShelterLab's mission, One Health approach, workflow, evidence boundary, prototype status, and next action without technical knowledge.
- **Priority:** Must
- **Delivery state:** Implemented in Sprint 11C; external 90-second comprehension validation pending
- **User story:** As a judge, shelter, NGO, teacher, or partner, I want a clear public entry so that I can assess relevance before entering detailed evidence.
- **Acceptance criteria:** Landing includes all approved sections and calls to action; guided tour has eight steps and complete controls; public accounts are read-only and require no login.
- **Related modules:** Public Site, Guided Tour, Public Demo, Judge Mode
- **Competition value:** Narrative clarity, accessibility, and partner credibility.
- **Government-data dependency:** Source use remains visible through existing evidence pages.
- **AI dependency:** None; public orchestration is deterministic.
- **Evidence chain dependency:** Public journey follows the implemented chain and links to source projections.
