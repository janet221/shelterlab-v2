# 09 Research License

### RLC-001 Required curriculum

- **Description:** Level 1 qualification shall cover dog behavior/stress signals, One Health and zoonotic awareness, urban ecology/population/habitat, shelter safety, and research ethics/data quality.
- **Priority:** Must
- **Delivery state:** Implemented
- **User story:** As a student, I want structured preparation so that I understand science and safety before observation.
- **Acceptance criteria:** Five published modules are versioned and visible; questions retain curriculum tags, dataset provenance, and review status.
- **Related modules:** Learning Modules, Curriculum Library, Question Bank
- **Competition value:** Educational completeness.
- **Government-data dependency:** Optional per question; provenance required when used.
- **AI dependency:** None for delivery; AI drafts require governance.
- **Evidence chain dependency:** Module/resource/question mappings required.

### RLC-002 Secure assessment

- **Description:** The server shall select published questions, randomize according to blueprint, hide correct answers before submission, and calculate immutable results.
- **Priority:** Must
- **Delivery state:** Implemented domain/demo runtime
- **User story:** As a teacher, I want assessment integrity so that licenses reflect demonstrated readiness.
- **Acceptance criteria:** Default blueprint uses 20 questions, 30 minutes, maximum 3 attempts, 30-minute cooldown; answers are scored server-side; attempt snapshots preserve question/options/versions/sources.
- **Related modules:** Quiz Engine, API, Attempt Snapshot
- **Competition value:** Credible qualification mechanism.
- **Government-data dependency:** Snapshot dataset IDs/states where applicable.
- **AI dependency:** AI cannot score or issue license.
- **Evidence chain dependency:** Published question → attempt snapshot → result.

### RLC-003 Passing and remediation rules

- **Description:** Overall pass score shall remain 80, each module minimum shall remain 60, and every module below 80 shall generate targeted remediation without automatically invalidating an otherwise valid pass.
- **Priority:** Must
- **Delivery state:** Implemented
- **User story:** As a student, I want specific remediation even when I pass so that weak competencies improve.
- **Acceptance criteria:** Both overall and module-minimum rules are enforced; approved/available resources are ranked by priority; below-80 recommendations are reproducible.
- **Related modules:** Scoring, Competency Results, Remediation
- **Competition value:** Personalized learning evidence.
- **Government-data dependency:** Recommended resources may include approved verified metadata.
- **AI dependency:** Deterministic recommendation; AI optional.
- **Evidence chain dependency:** Result → competency gap → resource assignment.

### RLC-004 License lifecycle and eligibility

- **Description:** A passing eligible attempt shall issue a Level 1 license valid for 180 days; active status shall be the sole observation eligibility input alongside assignment/shelter constraints.
- **Priority:** Must
- **Delivery state:** Implemented domain/demo runtime
- **User story:** As shelter staff, I want only currently qualified students assigned so that safety prerequisites are enforced.
- **Acceptance criteria:** Status supports active/expired/revoked/suspended/superseded; observation creation rejects inactive license; admin revocation is audited.
- **Related modules:** Research License, Observation Eligibility, Admin
- **Competition value:** Bridges classroom learning to field safety.
- **Government-data dependency:** None.
- **AI dependency:** AI cannot issue/revoke.
- **Evidence chain dependency:** Attempt/result/license/task links required.

### RLC-005 Official curriculum-standard integrity

- **Description:** Only codes/text verified against an official MOE or NAER source may be `OFFICIAL_VERIFIED`; current demonstration standards remain `DEMO_REFERENCE`.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As Curriculum Owner, I want official labels backed by sources so that the product never invents national curriculum alignment.
- **Acceptance criteria:** Source URL/version/evidence is stored; demo prefixes cannot be promoted; UI distinguishes official, demo, and unverified.
- **Related modules:** Learning Standards, Curriculum Competency Graph
- **Competition value:** Curriculum credibility.
- **Government-data dependency:** Official curriculum source verification pending.
- **AI dependency:** AI cannot infer official codes.
- **Evidence chain dependency:** Standard provenance is a required mapping node.
