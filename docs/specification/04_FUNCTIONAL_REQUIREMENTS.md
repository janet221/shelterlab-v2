# 04 Functional Requirements

This chapter defines the cross-product capabilities. Domain-specific details are normative in Chapters 06-18.

### FUN-001 Role-scoped entry points

- **Description:** The application shall provide role-appropriate student, teacher, shelter, and admin journeys backed by server-side authorization.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a signed-in user, I want relevant tasks and data so that I can act without seeing unauthorized functions.
- **Acceptance criteria:** Protected routes and mutations reject absent/incorrect roles; UI hiding is not the sole control.
- **Related modules:** Authentication, Dashboards, API
- **Competition value:** Usability and security.
- **Government-data dependency:** Admin-only dataset mutation.
- **AI dependency:** Provider controls are admin-governed.
- **Evidence chain dependency:** Actor and scope attach to mutations.

### FUN-002 Governed education-to-observation journey

- **Description:** The system shall support learning resources, assessment, license issuance, task assignment, timed observation, teacher review, shelter confirmation, and manual publication in order.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a student, I want each prerequisite made explicit so that I know when I may observe.
- **Acceptance criteria:** Active license is required; review gates cannot be skipped; published evidence is immutable.
- **Related modules:** Curriculum, Research License, Living Lab, Observation
- **Competition value:** Signature end-to-end workflow.
- **Government-data dependency:** Questions/inquiry may use approved verified sources.
- **AI dependency:** Validation/drafting optional and non-authoritative.
- **Evidence chain dependency:** Required at every transition.

### FUN-003 Revision and rejection workflows

- **Description:** Teacher and shelter reviewers shall approve, request revision, or reject within their authority, with reasons required for revision/rejection.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a reviewer, I want actionable reasoned decisions so that evidence quality can improve without overwriting history.
- **Acceptance criteria:** Blank reasons fail; actor/time/previous/new state persist; revisions create or preserve version lineage as defined by the domain.
- **Related modules:** Question Authoring, Observation Review, Audit
- **Competition value:** Data quality and governance.
- **Government-data dependency:** None.
- **AI dependency:** AI may flag issues but cannot choose disposition.
- **Evidence chain dependency:** Review and revision events are evidence nodes.

### FUN-004 Traceability queries

- **Description:** Authorized users and judges shall be able to trace sources to resources, standards, questions, attempts, licenses, observations, and downstream approved outputs.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a judge, I want to inspect lineage in both directions so that integration depth is verifiable.
- **Acceptance criteria:** Each visible node exposes ID, state, version, source/actor, and link relation; missing links make the chain incomplete.
- **Related modules:** Evidence Chain, Dashboard, Audit
- **Competition value:** Primary technical differentiator.
- **Government-data dependency:** Dataset snapshot and attribution are first-class nodes.
- **AI dependency:** Provider/model/prompt versions attach to AI nodes.
- **Evidence chain dependency:** This is the dependency itself.

### FUN-005 Manual publication

- **Description:** Public observation or adoption evidence shall publish only through an explicit shelter staff or admin action after shelter confirmation.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As shelter staff, I want publication separate from review so that I can control public timing and accuracy.
- **Acceptance criteria:** Confirmation does not auto-publish; teachers cannot publish shelter evidence; publish is audited; published records cannot be modified in place.
- **Related modules:** Observation, Shelter Platform, Adoption Accelerator
- **Competition value:** Animal-welfare governance.
- **Government-data dependency:** None.
- **AI dependency:** AI cannot publish.
- **Evidence chain dependency:** Confirmation and publication are separate links.
