# 02 User Personas

The four MVP roles remain the implemented authorization baseline. Additional personas are future scoped actors and do not silently gain permissions through the existing `UserRole` enum.

### PER-001 Student researcher

- **Description:** Students use test codes in the demo, complete approved learning, earn a Research License, and record only assigned non-contact observations.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a secondary student, I want a clear path from learning to safe field inquiry so that I can contribute useful evidence.
- **Acceptance criteria:** Student identity is pseudonymous; only active-license and assigned-task journeys are available; submitted evidence is not directly editable.
- **Related modules:** Student Dashboard, Research License, Living Lab, Observation
- **Competition value:** Authentic student inquiry and scientific literacy.
- **Government-data dependency:** Used in curriculum/inquiry context, not identity.
- **AI dependency:** Optional feedback only; no authority.
- **Evidence chain dependency:** Attempt, license, task, and observation are linked.

### PER-002 Teacher and curriculum reviewer

- **Description:** Teachers manage authorized courses/classes, resources, question drafts, student remediation, and first-stage observation review.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a teacher, I want curriculum and evidence governance within my authorized classes so that field learning remains educationally valid.
- **Acceptance criteria:** Course scope is checked server-side; non-admin authors cannot approve their own questions; revision/rejection reasons are retained.
- **Related modules:** Teacher Platform, Curriculum, Question Authoring, Research License, Observation Review
- **Competition value:** Teacher-governed AI and education accountability.
- **Government-data dependency:** Teachers map verified sources to learning use.
- **AI dependency:** Teachers review AI drafts; AI is optional.
- **Evidence chain dependency:** Teacher mappings and reviews are persistent nodes.

### PER-003 Shelter authority

- **Description:** Shelter staff manage dog facts/zones, perform final observation confirmation, publish manually, and own future adoption-support decisions.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As shelter staff, I want final control over animal-related evidence so that welfare and public information remain accurate.
- **Acceptance criteria:** Dog writes and publication require shelter/admin authority; shelter review follows teacher approval; publication is a separate manual action.
- **Related modules:** Shelter Dashboard, Dog Records, Observation Review, Adoption Accelerator
- **Competition value:** Practical partner governance and animal-welfare protection.
- **Government-data dependency:** Aggregate statistics may provide context only.
- **AI dependency:** AI may draft but cannot confirm or publish.
- **Evidence chain dependency:** Shelter confirmation and publication are distinct nodes.

### PER-004 System administrator

- **Description:** Admins manage datasets, users/configuration, global question publication, audits, retention, and operational controls without bypassing domain truth.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As an administrator, I want governed system controls so that the demo and future deployment are reliable and auditable.
- **Acceptance criteria:** Privileged actions require backend role checks and audit; credentials are externalized; admin exceptions are explicitly documented.
- **Related modules:** Admin Dashboard, Security, Open Data, Audit, Deployment
- **Competition value:** Operational feasibility and governance maturity.
- **Government-data dependency:** Admin controls activation and Sync Now.
- **AI dependency:** Admin configures approved providers but cannot create automatic approval.
- **Evidence chain dependency:** Privileged mutations generate audit evidence.

### PER-005 Future service participants

- **Description:** Foster volunteers, outing participants, adopters, school administrators, government viewers, and judges are future or read-only personas with purpose-limited access.
- **Priority:** Should
- **Delivery state:** Planned
- **User story:** As a future participant, I want only the information and actions needed for my role so that expansion does not weaken privacy or authority boundaries.
- **Acceptance criteria:** New roles receive explicit scopes before implementation; public/judge views expose only approved or synthetic aggregate data; no role is inferred from free text.
- **Related modules:** Adoption Accelerator, Identity, Privacy, Dashboard, Competition Demo
- **Competition value:** Scalable ecosystem design.
- **Government-data dependency:** Government viewers receive aggregates only.
- **AI dependency:** No AI eligibility/matching authority.
- **Evidence chain dependency:** Future service events link only to approved evidence.
