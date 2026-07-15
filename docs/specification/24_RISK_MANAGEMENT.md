# 24 Risk Management

### RSK-001 Versioned risk register

- **Description:** Product, safety, privacy, legal, data, AI, security, partner, schedule, and demo risks shall have owner, likelihood, impact, mitigation, trigger, contingency, status, and review date.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As Product Owner, I want active risk ownership so that blockers are addressed before they become incidents.
- **Acceptance criteria:** Critical/high risks are reviewed each sprint; accepted risks have authority/reason; closed risks retain history.
- **Related modules:** Master Risk Register, Sprint Governance
- **Competition value:** Management maturity.
- **Government-data dependency:** Source/license/freshness risks tracked.
- **AI dependency:** Model/privacy/hallucination risks tracked.
- **Evidence chain dependency:** Integrity risks tracked.

### RSK-002 Safety stop and incident escalation

- **Description:** Field and adoption programs shall define stop conditions, immediate actions, notification, evidence preservation, and resumption authority.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As shelter/school authority, I want clear escalation so that safety overrides data collection.
- **Acceptance criteria:** Incident severity and contacts are configured; students cannot continue after stop; only authorized authority resumes; post-incident review is documented.
- **Related modules:** Living Lab, Incident, Notifications, Partner Policy
- **Competition value:** Real-world feasibility.
- **Government-data dependency:** None.
- **AI dependency:** AI cannot close incidents.
- **Evidence chain dependency:** Incident links to task/session without exposing private details publicly.

### RSK-003 Source, copyright, and curriculum risk

- **Description:** Unverified source details, iLearn content, question-bank material, and official curriculum codes shall remain restricted until evidence supports use.
- **Priority:** Must
- **Delivery state:** Implemented policy
- **User story:** As Data/Curriculum Owner, I want conservative source use so that the project avoids fabricated official status or copyright misuse.
- **Acceptance criteria:** 6318 remains outbound-only; 29027 cannot feed questions; current standards remain demo references; unavailable sources are hidden/disabled.
- **Related modules:** Open Data, Curriculum, AI Governance
- **Competition value:** Trustworthy public-data use.
- **Government-data dependency:** Core.
- **AI dependency:** AI cannot bypass source restrictions.
- **Evidence chain dependency:** Source state governs downstream eligibility.

### RSK-004 Claim and pilot risk

- **Description:** No real learning, shelter, adoption, or policy impact shall be claimed without approved pilot evidence, definitions, privacy controls, and limitations.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As judge/public stakeholder, I want claims bounded by evidence so that I am not misled.
- **Acceptance criteria:** Synthetic metrics labeled; pilot cohort/date/method documented; causal terms require evaluation approval; screenshots/data require written permission.
- **Related modules:** Analytics, Competition Demo, Privacy
- **Competition value:** Credibility.
- **Government-data dependency:** Official context does not prove program impact.
- **AI dependency:** AI summaries follow claim policy.
- **Evidence chain dependency:** Every claim maps to evidence class.

### RSK-005 Technical concentration and fallback

- **Description:** Critical dependencies including database, network, government endpoints, AI provider, storage, and demo hardware shall have monitored fallback and de-scope rules.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As engineering/demo owner, I want dependency failure contained so that core qualification and evidence remain available or fail safely.
- **Acceptance criteria:** Failure behavior matches architecture; no mutation proceeds without database/audit; verified fixtures/manual workflows support demo; de-scope order is approved.
- **Related modules:** Deployment, Open Data, AI, Competition Demo
- **Competition value:** Reliability.
- **Government-data dependency:** Last-success and fixture fallback.
- **AI dependency:** Deterministic/manual fallback.
- **Evidence chain dependency:** Fallback mode visible.
