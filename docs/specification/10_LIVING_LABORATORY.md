# 10 Living Laboratory

### LAB-001 Non-contact field model

- **Description:** Shelter learning shall occur only in shelter-approved zones through non-contact observation; students shall not touch, feed, enter kennels, or make operational decisions.
- **Priority:** Must
- **Delivery state:** Implemented domain and synthetic journey; real partner deployment required
- **User story:** As shelter authority, I want a bounded citizen-science protocol so that education does not compromise welfare or safety.
- **Acceptance criteria:** Tasks specify shelter/dog/zone/time; safety rules are taught and tested; prohibited actions are visible; incidents stop the activity.
- **Related modules:** Research License, Task Assignment, Shelter Zones, Observation
- **Competition value:** Distinctive safe Living Lab design.
- **Government-data dependency:** Aggregate context only.
- **AI dependency:** None.
- **Evidence chain dependency:** License and assignment precede session.

### LAB-002 Assigned research tasks

- **Description:** Students shall observe only assigned dogs at assigned shelters under linked teacher and shelter authority.
- **Priority:** Must
- **Delivery state:** Implemented domain and synthetic journey
- **User story:** As a student, I want Today's Tasks to show an approved assignment so that I know where and what I may observe.
- **Acceptance criteria:** Task includes student, active license, dog, shelter, zone, teacher, staff, window, and status; unauthorized selection is rejected server-side.
- **Related modules:** Today Tasks, Assignment, Authorization
- **Competition value:** Operational realism.
- **Government-data dependency:** None.
- **AI dependency:** AI cannot assign dogs.
- **Evidence chain dependency:** Task is the link between license and session.

### LAB-003 Scientific protocol consistency

- **Description:** Observation procedures shall use a fixed 300-second maximum, controlled behavior dictionary, timestamps, durations, context, and limitation-aware notes.
- **Priority:** Must
- **Delivery state:** Implemented domain
- **User story:** As a teacher, I want consistent protocols so that student records can be compared and reviewed.
- **Acceptance criteria:** Session and event schemas validate ranges; protocol version is identifiable; behavior definitions are available; data quality flags do not rewrite evidence.
- **Related modules:** Observation Engine, Validation, Learning Evidence
- **Competition value:** Scientific inquiry and data-quality depth.
- **Government-data dependency:** None.
- **AI dependency:** Deterministic flags; AI optional later.
- **Evidence chain dependency:** Protocol/version attach to session.

### LAB-004 Partner operating agreement

- **Description:** Field deployment shall require named school/shelter authority, approved zones/protocol, incident process, staffing, consent attestations, data-use terms, and stop criteria.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As a partner organization, I want explicit responsibilities so that a pilot is safe and governable.
- **Acceptance criteria:** Signed/approved operating checklist exists before real tasks; authority contacts and escalation are configured; pilot claims identify scope/date.
- **Related modules:** Partner Onboarding, Privacy, Safety, Deployment
- **Competition value:** Feasibility and stakeholder readiness.
- **Government-data dependency:** None.
- **AI dependency:** AI use requires separate approval.
- **Evidence chain dependency:** Partner/protocol version scopes real evidence.
