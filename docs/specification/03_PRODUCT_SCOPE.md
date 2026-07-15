# 03 Product Scope

### SCP-001 Competition MVP scope

- **Description:** The competition MVP shall demonstrate verified open data, curriculum traceability, governed question drafting, Research License qualification, non-contact observation, dual review, an evidence timeline, selected adoption support, and honest dashboards.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As the Product Owner, I want a coherent seven-minute product journey so that effort is concentrated on judging value.
- **Acceptance criteria:** Every demonstrated module is operational or clearly labeled fallback; each transition has evidence; future-only screens are not represented as completed.
- **Related modules:** All competition-facing modules
- **Competition value:** Directly maximizes innovation, education, open-data use, and presentation scores.
- **Government-data dependency:** At least one activated education source and one shelter source.
- **AI dependency:** Deterministic fallback mandatory; real provider optional.
- **Evidence chain dependency:** Required.

### SCP-002 Explicit exclusions

- **Description:** The product shall exclude diagnosis, dangerous-dog labeling, automated adopter or animal eligibility, unreviewed public claims, student animal handling, student faces, invented official codes, copied copyrighted content, and automatic approval/publication.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As a privacy, education, or shelter authority, I want high-risk uses prohibited so that the Living Lab remains ethical.
- **Acceptance criteria:** Requirements, UI copy, backend policy, tests, and demo claims do not enable or imply excluded uses.
- **Related modules:** AI Governance, Observation, Curriculum, Adoption, Privacy
- **Competition value:** Responsible innovation and risk control.
- **Government-data dependency:** Aggregate data cannot be converted into individual claims.
- **AI dependency:** Applies to every AI agent.
- **Evidence chain dependency:** Unsupported content cannot enter approved chain states.

### SCP-003 Production scope separation

- **Description:** Production identity, durable persistence, migrations, scheduled jobs, private media, observability, partner onboarding, consent, and recovery are required before field deployment but need not all be live in the competition demo.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As an engineering owner, I want demo and production definitions separated so that technical debt is visible and claims remain accurate.
- **Acceptance criteria:** Release gates identify production blockers; demo fixtures are labeled; no real student/shelter pilot starts before gates pass.
- **Related modules:** Deployment, Security, Privacy, Data Model, Testing
- **Competition value:** Feasibility without overclaiming readiness.
- **Government-data dependency:** Live sync belongs to production operations.
- **AI dependency:** Real AI requires a separate release gate.
- **Evidence chain dependency:** Production records require durable transactional evidence.

### SCP-004 Change control

- **Description:** Approved architecture and master decisions shall be changed only through explicit Product Owner decisions and documented impact analysis.
- **Priority:** Must
- **Delivery state:** Implemented as documentation governance
- **User story:** As Product Owner, I want controlled scope changes so that completed behavior is preserved across sprints.
- **Acceptance criteria:** Conflicts cite decision IDs; superseded statements remain historical; implementation does not silently redesign architecture.
- **Related modules:** Product Governance, Documentation, Roadmap
- **Competition value:** Delivery discipline.
- **Government-data dependency:** Source status changes require verification records.
- **AI dependency:** Provider activation requires governance approval.
- **Evidence chain dependency:** Versioned specifications preserve decision provenance.
