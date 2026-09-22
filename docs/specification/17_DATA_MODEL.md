# 17 Data Model

## Current Model Families

| Family | Principal current models | Baseline status |
|---|---|---|
| Identity and scope | `User`, `Shelter`, `TeacherCourseAuthorization` | Schema implemented; production identity/class tenancy incomplete |
| Dogs and observation | `Dog`, mission/session/event, review, score, publication, timeline, evidence profile, media metadata | Sprint 7 schema/domain and synthetic journey implemented; migration execution/runtime repository pending |
| Curriculum | `LearningModule`, `LearningStandard`, module-standard mappings, `CurriculumResource`, course/week and resource mappings | Schema/domain implemented; some runtime state demo-backed |
| Question governance | `Question`, `QuestionOption`, `QuestionDraft`, generation blueprints and mappings | Schema/domain implemented; deterministic/mock provider only |
| Research License | `QuizBlueprint`, requirements, `QuizAttempt`, attempt questions/answers, `ResearchLicense`, remediation | Schema/domain implemented; runtime demo limitations remain |
| Government evidence | `GovernmentDataset`, snapshot, sync run, field mapping, usage, attribution | Implemented with verified fixtures for 6318/40121/41236 |
| Governance | `AuditLog`, provider configuration, review/version metadata | Partial; production transactions and access policy incomplete |
| Adoption/impact | Evidence Timeline/profile versions, metric definitions/runs/results and competition score mappings | Sprint 8 impact schema/domain implemented; migration execution, real cohorts and adoption operations remain future |

### DAT-001 Core identity and authority entities

- **Description:** Production data shall model pseudonymous users, roles, organizations, shelters, schools, courses/classes, grants, and organization scopes explicitly.
- **Priority:** Must
- **Delivery state:** Implemented schema/domain; migration execution and durable runtime repository pending
- **User story:** As security owner, I want authority represented in data so that access is enforceable and reviewable.
- **Acceptance criteria:** User/role/scope relationships have constraints and indexes; no real student name is required; grant/revoke history is auditable.
- **Related modules:** User, Shelter, TeacherCourseAuthorization, future School/Class
- **Competition value:** Scalable governance architecture.
- **Government-data dependency:** School directory data cannot silently create user authority.
- **AI dependency:** Scope constrains AI actions.
- **Evidence chain dependency:** Actor/scope identify evidence creators/reviewers.

### DAT-002 Curriculum and assessment entities

- **Description:** Learning modules/standards/resources/mappings, questions/options/versions, blueprints/drafts/reviews, attempts/answers, licenses, and remediation shall be versioned and relationally traceable.
- **Priority:** Must
- **Delivery state:** Implemented schema; partial runtime persistence
- **User story:** As curriculum owner, I want durable lineage so that learning decisions can be reconstructed.
- **Acceptance criteria:** Published questions and submitted attempts are immutable snapshots; official/demo statuses persist; indexes support trace queries.
- **Related modules:** Prisma Curriculum, Question, Quiz, License Models
- **Competition value:** Evidence-depth foundation.
- **Government-data dependency:** Dataset/resource foreign keys and snapshot IDs.
- **AI dependency:** Draft provider metadata stored.
- **Evidence chain dependency:** Required.

### DAT-003 Observation entities

- **Description:** Dog, task, observation session/event, validation, review, version, incident, media, confirmation, and publication data shall preserve review order and immutability.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As shelter authority, I want durable field evidence so that review and publication are trustworthy.
- **Acceptance criteria:** Session max and event constraints are validated; revisions link versions; confirmation and publication metadata are separate; published history is append-only.
- **Related modules:** Dog, ObservationSession, BehaviorEvent, Audit
- **Competition value:** Living Lab technical core.
- **Government-data dependency:** No individual dog relationship to aggregate datasets.
- **AI dependency:** Flags/drafts stored separately from source.
- **Evidence chain dependency:** Required.

### DAT-004 Open-data and provenance entities

- **Description:** Dataset registry, snapshots, sync runs, field mappings, attributions, usages, and source hashes shall persist separately from curriculum/business entities.
- **Priority:** Must
- **Delivery state:** Implemented schema and seed
- **User story:** As Data Steward, I want reproducible source snapshots so that downstream evidence remains attributable.
- **Acceptance criteria:** Dataset/content hash uniqueness prevents duplicates; last-success marker is queryable; usage references product entities; source metadata includes display mode.
- **Related modules:** GovernmentDataset models
- **Competition value:** EDUOD technical proof.
- **Government-data dependency:** Core dependency.
- **AI dependency:** Dataset eligibility constrains generation.
- **Evidence chain dependency:** Source root.

### DAT-005 Adoption and analytics entities

- **Description:** Future schema shall add evidence-linked profile versions, foster/outing/meeting/adoption/follow-up cases, consent-safe contacts, metric definitions/results, and GIS layer versions.
- **Priority:** Should
- **Delivery state:** Planned
- **User story:** As shelter/data owner, I want downstream records linked to approved evidence so that service impact is auditable.
- **Acceptance criteria:** No denormalized public claim lacks source/status; sensitive participant fields are separated; retention and access classification are defined before migration.
- **Related modules:** Adoption Accelerator, Analytics, GIS
- **Competition value:** End-state completeness.
- **Government-data dependency:** Aggregate context links by snapshot, never dog ID.
- **AI dependency:** Draft metadata separated from approved output.
- **Evidence chain dependency:** Required.

### DAT-006 Migration and repository discipline

- **Description:** Production shall use reviewed migration history and repository/service boundaries instead of in-memory stores for authority-bearing state.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As engineer, I want safe schema evolution and durable repositories so that deployment is recoverable.
- **Acceptance criteria:** Migrations are additive/reviewed/backed up; seed is idempotent; transactions include audit; no destructive migration runs without approval.
- **Related modules:** Prisma Migrations, Repositories, Deployment
- **Competition value:** Production feasibility.
- **Government-data dependency:** Snapshot migrations preserve hashes/provenance.
- **AI dependency:** Provider metadata survives schema evolution.
- **Evidence chain dependency:** Historical links are never broken.
