# 14 Adoption Accelerator

This chapter includes the Sprint 10A deterministic synthetic evidence-profile implementation and Sprint 10B read-only Evidence Story projection. No production adoption decision, matching, temporary-care, or follow-up capability is implemented.

### ADA-001 Dog evidence timeline

- **Description:** Shelter-confirmed published observations and approved program events shall form a versioned dog evidence timeline controlled by shelter authority.
- **Priority:** Must
- **Delivery state:** Implemented demo in Sprint 10A; future operational events remain placeholders
- **User story:** As shelter staff, I want reviewed evidence organized over time so that public profiles are better supported.
- **Acceptance criteria:** Only published/approved evidence enters timeline; source session/event/reviewer is traceable; archived evidence remains historical.
- **Related modules:** Observation, Evidence Chain, Dog Profile
- **Competition value:** Converts education evidence into shelter value.
- **Government-data dependency:** Aggregate statistics remain context, never dog evidence.
- **AI dependency:** Summary drafting optional.
- **Evidence chain dependency:** Required.

### ADA-002 Shelter-approved public profile

- **Description:** Public dog profiles shall use shelter-owned facts and evidence-linked, limited language; unknown facts remain unknown.
- **Priority:** Must
- **Delivery state:** Implemented demo in Sprint 10A; Sprint 10B adds expandable privacy-filtered story traces; production repository and identity pending
- **User story:** As an adopter, I want transparent evidence-limited information so that I can prepare informed questions.
- **Acceptance criteria:** Shelter approval required; no visual breed inference, diagnosis, dangerous labels, guaranteed temperament, or automated suitability claim; profile versions are auditable.
- **Related modules:** Dog Profile, Shelter Review, Public View
- **Competition value:** Responsible social-impact extension.
- **Government-data dependency:** None for individual profile.
- **AI dependency:** None in Sprint 10A; AI summaries are explicitly prohibited.
- **Evidence chain dependency:** Every claim links to evidence or shelter fact.

### ADA-003 Foster and one-day outing programs

- **Description:** Future programs shall manage applications, eligibility by human shelter policy, assignment, care/safety plan, check-in, incident, return, and evidence review.
- **Priority:** Should
- **Delivery state:** Planned
- **User story:** As shelter staff or approved volunteer, I want a controlled temporary-care workflow so that more contextual evidence can be collected safely.
- **Acceptance criteria:** Shelter decides eligibility; household/volunteer data is purpose-limited; incidents escalate; program evidence is reviewed before profile use.
- **Related modules:** Foster Management, Outing Program, Notifications, Privacy
- **Competition value:** Service innovation and adoption support.
- **Government-data dependency:** None.
- **AI dependency:** No eligibility authority; summaries optional.
- **Evidence chain dependency:** Program event → review → timeline.

### ADA-004 Matching and meeting support

- **Description:** Matching shall explain evidence-based compatibility factors and uncertainty but shall not automate adopter eligibility or guarantee outcomes.
- **Priority:** Could
- **Delivery state:** Planned
- **User story:** As an adopter, I want understandable suggestions and meeting preparation so that discovery is safer and more transparent.
- **Acceptance criteria:** Matching separates hard shelter policy from preferences; reasons cite approved profile evidence; human staff controls progression.
- **Related modules:** Matching Engine, Inquiry, Booking, Shelter Case Management
- **Competition value:** Responsible adoption innovation.
- **Government-data dependency:** None for individual match.
- **AI dependency:** Optional ranking/explanation under governance; no final decision.
- **Evidence chain dependency:** Suggestions cite approved profile/evidence version.

### ADA-005 Adoption follow-up

- **Description:** The system shall support scheduled privacy-sensitive follow-ups, help requests, outcome states, and shelter escalation without shaming adopters.
- **Priority:** Should
- **Delivery state:** Planned
- **User story:** As an adopter, I want post-adoption support so that emerging issues can be addressed early.
- **Acceptance criteria:** Consent and communication preference are stored; urgent welfare/safety paths escalate; outcomes are access-controlled and aggregated for metrics.
- **Related modules:** Follow-up, Notifications, Support Case, Analytics
- **Competition value:** Longitudinal social impact.
- **Government-data dependency:** Aggregate context only.
- **AI dependency:** Summary/triage suggestions optional; human response required.
- **Evidence chain dependency:** Adoption event → follow-up → aggregate outcome.
