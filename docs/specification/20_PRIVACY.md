# 20 Privacy

### PRV-001 Data minimization for minors

- **Description:** ShelterLab shall not require real student names and shall use pseudonymous/test identifiers for demo and minimum necessary identifiers for production.
- **Priority:** Must
- **Delivery state:** Implemented for synthetic/public Living Lab views; production identity governance pending
- **User story:** As a student/guardian, I want minimal personal data collected so that educational participation does not create avoidable exposure.
- **Acceptance criteria:** No student name is in seed/demo; roster mapping is school-controlled if later required; public and analytics views cannot identify students.
- **Related modules:** Identity, Seed, Dashboards, Analytics
- **Competition value:** Ethical youth technology.
- **Government-data dependency:** Aggregate school data is not joined to student identity.
- **AI dependency:** Minor identity is excluded from provider payloads.
- **Evidence chain dependency:** Pseudonymous actor ID is sufficient.

### PRV-002 Consent and participation governance

- **Description:** Real deployment shall record versioned school/teacher participation and required consent/attestation evidence without unnecessarily storing guardian documents.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As school administrator, I want participation evidence so that field learning has accountable authorization.
- **Acceptance criteria:** Policy version/date/authority/scope/status are stored; withdrawal stops future activity; legal basis and Taiwan-specific review are approved before pilot.
- **Related modules:** School Administration, Consent, Partner Onboarding
- **Competition value:** Field feasibility and ethics.
- **Government-data dependency:** None.
- **AI dependency:** Consent separately covers any external AI processing.
- **Evidence chain dependency:** Participation authority scopes real evidence.

### PRV-003 Media and face protection

- **Description:** Student faces, visitor identity, conversations, and private shelter areas shall not be public; media is private by default and subject to review/retention.
- **Priority:** Must
- **Delivery state:** Metadata/privacy-state model and public filtering implemented; binary storage lifecycle pending
- **User story:** As privacy owner, I want media controlled so that educational evidence does not expose people.
- **Acceptance criteria:** Upload guidance and review exist; privacy issue blocks publication; access is authorized; deletion/retention and incident response are tested.
- **Related modules:** Media, Observation, Object Storage, Privacy Review
- **Competition value:** Responsible real-world design.
- **Government-data dependency:** None.
- **AI dependency:** Automated detection cannot replace human review.
- **Evidence chain dependency:** Media review/hash links to evidence version.

### PRV-004 Purpose limitation and retention

- **Description:** Each data class shall have purpose, access class, retention, deletion/anonymization, export, and incident handling rules.
- **Priority:** Must
- **Delivery state:** Missing
- **User story:** As privacy owner, I want lifecycle controls so that data is not retained or reused indefinitely.
- **Acceptance criteria:** Approved schedule covers student, observation, media, adopter/foster, audit, and analytics data; legal holds/exceptions are documented; jobs enforce schedules.
- **Related modules:** Data Governance, Jobs, Audit, Adoption
- **Competition value:** Production maturity.
- **Government-data dependency:** Official snapshots follow license/retention policy.
- **AI dependency:** Provider retention/training terms approved.
- **Evidence chain dependency:** Deletion preserves lawful minimal audit integrity.

### PRV-005 Privacy-safe analytics and public views

- **Description:** Public/government dashboards shall use de-identification, minimum-cell suppression, generalized geography, and no student/adopter/staff ranking.
- **Priority:** Must
- **Delivery state:** Partial; Sprint 7 dog evidence is privacy-filtered, aggregate suppression remains planned
- **User story:** As public stakeholder, I want useful aggregates without exposing individuals.
- **Acceptance criteria:** Privacy thresholds are approved and tested; suppressed cells cannot be reconstructed through filters; exports apply the same policy.
- **Related modules:** Analytics, GIS, Export, Dashboard
- **Competition value:** Safe policy impact.
- **Government-data dependency:** Official aggregates keep attribution.
- **AI dependency:** AI summaries cannot reveal suppressed values.
- **Evidence chain dependency:** Aggregate results link to governed metric/source versions.
