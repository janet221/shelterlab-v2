# 11 Observation System

### OBS-001 Session lifecycle

- **Description:** Observation sessions shall follow `draft -> running -> submitted -> teacher review/revision/rejection -> shelter review/revision/rejection/confirmation -> separate manual publication -> archived`.
- **Priority:** Must
- **Delivery state:** Implemented domain and synthetic journey; durable repository pending
- **User story:** As a participant, I want a visible controlled workflow so that responsibility is clear.
- **Acceptance criteria:** Students cannot edit after submit; published sessions are immutable; teacher cannot perform shelter authority; publication requires shelter staff/admin manual action after confirmation.
- **Related modules:** Session Engine, Workflow, Authorization
- **Competition value:** Core product workflow.
- **Government-data dependency:** None.
- **AI dependency:** AI cannot transition state.
- **Evidence chain dependency:** Every transition is audited.

### OBS-002 Structured behavior events

- **Description:** A session shall record timestamped behavior events using the approved 20-code dictionary, positive duration, confidence, and optional objective observer note.
- **Priority:** Must
- **Delivery state:** Implemented domain
- **User story:** As a student, I want fast structured controls so that I can record behavior during a timed session.
- **Acceptance criteria:** Codes include APPROACH through OTHER as documented; timestamps/durations remain inside session; stable timeline preserves event order.
- **Related modules:** Behavior Event, Timer UI, Timeline
- **Competition value:** Citizen-science data structure.
- **Government-data dependency:** None.
- **AI dependency:** None.
- **Evidence chain dependency:** Events belong to immutable session version.

### OBS-003 Deterministic validation

- **Description:** Validation shall flag missing behaviors, empty notes, duplicate timestamps, non-positive duration, outside-session events, excessive identical events, and subjective language without modifying source data.
- **Priority:** Must
- **Delivery state:** Implemented
- **User story:** As a student, I want actionable quality feedback so that I can improve objective recording.
- **Acceptance criteria:** Sessions over 300 seconds and invalid events are rejected; subjective phrases generate warnings; flags and original payload are both retained.
- **Related modules:** Validation Service, Submission Result
- **Competition value:** Responsible AI-like assistance without model risk.
- **Government-data dependency:** None.
- **AI dependency:** No LLM; deterministic only.
- **Evidence chain dependency:** Validation flags attach to submitted version.

### OBS-004 Review and revision evidence

- **Description:** Teacher and shelter review shall support approve, revision, and reject with required reason; a revision shall preserve submitted history rather than overwrite it.
- **Priority:** Must
- **Delivery state:** Implemented domain and synthetic journey
- **User story:** As a reviewer, I want replay and reasoned feedback so that quality improves transparently.
- **Acceptance criteria:** Timeline replay is available; allowed reason categories/free detail are captured; revised version links to prior version; prior review remains readable.
- **Related modules:** Teacher Review, Shelter Review, Audit, Versioning
- **Competition value:** Dual-authority evidence quality.
- **Government-data dependency:** None.
- **AI dependency:** Flags assist but do not decide.
- **Evidence chain dependency:** Required.

### OBS-005 Media integrity and privacy

- **Description:** If media is enabled, SHA-256 shall be calculated after backend upload, duplicate checks shall warn, and media shall remain private/quarantined until reviewed.
- **Priority:** Should
- **Delivery state:** Metadata/privacy-state model implemented; binary upload infrastructure pending
- **User story:** As privacy owner, I want server-trusted media integrity so that client claims and accidental public exposure are controlled.
- **Acceptance criteria:** Client checksum is ignored; student faces/private visitor data block publication; access is signed/authorized; retention/deletion is enforced.
- **Related modules:** Media Upload, Checksum, Privacy Review, Object Storage
- **Competition value:** Trust and implementation maturity.
- **Government-data dependency:** None.
- **AI dependency:** Face/privacy detection requires separate approval; manual review remains authoritative.
- **Evidence chain dependency:** Media hash and review attach to session version.
