# 12 Teacher Platform

### TCH-001 Curriculum studio

- **Description:** Authorized teachers shall discover/import metadata, review resources, map them to modules/standards/weeks, and manage availability and remediation priority.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a teacher, I want one curriculum workspace so that source evidence becomes teachable material.
- **Acceptance criteria:** Only approved/available resources reach required student use; metadata/content/course approval states are distinct; every mutation is audited.
- **Related modules:** Curriculum Library, Resource Import, Course Plan
- **Competition value:** Converts open data into education workflow.
- **Government-data dependency:** Verified dataset/resource metadata.
- **AI dependency:** None.
- **Evidence chain dependency:** Resource mappings are trace nodes.

### TCH-002 Question authoring governance

- **Description:** Teachers/admins shall create/edit drafts, submit review, independently approve/reject/revise, and explicitly publish within authority scope.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a teacher, I want efficient governed authoring so that Research License content stays accurate.
- **Acceptance criteria:** Author self-approval blocked unless admin; reasons required; teachers publish only authorized courses; approval/publication audits are separate.
- **Related modules:** Question Studio, Teacher Authorization, Audit
- **Competition value:** Teacher-governed AI differentiator.
- **Government-data dependency:** Dataset provenance required by blueprint.
- **AI dependency:** AI draft optional; human workflow mandatory.
- **Evidence chain dependency:** Full authoring chain required.

### TCH-003 Student readiness and remediation dashboard

- **Description:** Teachers shall see class-scoped module completion, attempts, license status, competency gaps, assigned remediation, and readiness without exposing answers before submission.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a teacher, I want readiness evidence so that I can support students before field activity.
- **Acceptance criteria:** Course/class scope enforced; below-80 modules are visible; approved resources can be assigned; no cross-class leakage or student ranking.
- **Related modules:** Teacher Dashboard, Research License, Remediation
- **Competition value:** Practical educational value.
- **Government-data dependency:** Source provenance visible for data-based items.
- **AI dependency:** Recommendations deterministic by default.
- **Evidence chain dependency:** Result and assignment lineage available.

### TCH-004 Observation review queue

- **Description:** Teachers shall review only assigned submitted sessions with replay, behavior timeline, validation flags, and revision/rejection forms.
- **Priority:** Must
- **Delivery state:** Demo only
- **User story:** As a teacher, I want a focused queue so that scientific quality review is efficient.
- **Acceptance criteria:** Pending count/filter exists; reasons required; teacher approval sends to shelter review and never publishes.
- **Related modules:** Observation Review, Teacher Dashboard
- **Competition value:** Demonstrates dual review in operation.
- **Government-data dependency:** None.
- **AI dependency:** Deterministic flags displayed.
- **Evidence chain dependency:** Teacher review node required.

### TCH-005 Course and class authorization

- **Description:** Production shall persist teacher-course-class authorization, roster scope, grant/revoke history, and substitute/delegation policy.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As school administrator, I want explicit authority assignments so that teachers access only their classes.
- **Acceptance criteria:** Grants are admin/school-authority controlled and audited; revocation takes effect promptly; API queries enforce scope.
- **Related modules:** Identity, Authorization, School Administration
- **Competition value:** Deployment feasibility.
- **Government-data dependency:** None.
- **AI dependency:** Scope limits AI authoring/assignment.
- **Evidence chain dependency:** Actor scope stored with actions.
