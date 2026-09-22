# 08 AI Governance

### AIG-001 Provider-neutral governed envelope

- **Description:** Every AI capability shall accept purpose, approved source IDs, structured input, policy/prompt versions, and return draft output, citations, confidence explanation, risk flags, and provider/model metadata.
- **Priority:** Must
- **Delivery state:** Partial
- **User story:** As AI Governance Owner, I want provider-neutral traceability so that models can change without bypassing controls.
- **Acceptance criteria:** Zod validates inputs/outputs; fabricated source IDs fail; provider/model/prompt/time are persisted; deterministic provider remains available.
- **Related modules:** AI Provider Interface, Question Generation, Audit
- **Competition value:** Explainable and governable AI architecture.
- **Government-data dependency:** Source-grounded agents require approved dataset/resource IDs.
- **AI dependency:** Core dependency.
- **Evidence chain dependency:** AI draft and provenance are nodes.

### AIG-002 No autonomous authority

- **Description:** AI shall never approve questions/observations, issue licenses, confirm shelters, publish evidence, diagnose, rank adopter eligibility, or mutate original student records.
- **Priority:** Must
- **Delivery state:** Implemented as policy/domain guards
- **User story:** As a domain reviewer, I want AI limited to assistance so that accountability remains human.
- **Acceptance criteria:** Provider interfaces lack authority operations; backend state machines reject AI actors; validation returns flags only.
- **Related modules:** Workflow Engines, Authorization, AI Agents
- **Competition value:** Responsible AI differentiation.
- **Government-data dependency:** None.
- **AI dependency:** Applies to all agents.
- **Evidence chain dependency:** Human approval remains a separate required node.

### AIG-003 Question draft generation

- **Description:** Teacher/admin-authorized generation shall create source-grounded drafts that require independent review and explicit publication.
- **Priority:** Must
- **Delivery state:** Demo only
- **User story:** As a teacher, I want AI-assisted drafts from approved evidence so that authoring is faster without losing control.
- **Acceptance criteria:** Workflow is `AI_DRAFT/DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED`; non-admin author cannot self-approve; rejection/revision reason is required; publication is separately audited.
- **Related modules:** Curriculum Library, Question Authoring, Research License
- **Competition value:** High-impact education AI story.
- **Government-data dependency:** Required when blueprint declares government data.
- **AI dependency:** Deterministic/mock now; real provider future.
- **Evidence chain dependency:** Source → blueprint → draft → review → published question.

### AIG-004 Observation and adoption assistants

- **Description:** Future AI may suggest objective wording or draft adoption summaries from approved evidence but shall not rewrite source records or make suitability claims.
- **Priority:** Could
- **Delivery state:** Planned
- **User story:** As a student or shelter reviewer, I want bounded drafting help so that communication improves without changing facts.
- **Acceptance criteria:** Original data remains immutable; suggestions are labeled; unsupported emotion/diagnosis/adoption claims are flagged; shelter approval is required for public text.
- **Related modules:** Observation Assistant, Adoption Summary Generator
- **Competition value:** Practical AI extension.
- **Government-data dependency:** Aggregate context may be cited but not individualized.
- **AI dependency:** Required for this capability; deterministic fallback may provide flags.
- **Evidence chain dependency:** Draft links only to approved evidence IDs.

### AIG-005 Evaluation and release gate

- **Description:** A real AI provider shall remain disabled until privacy, source-alignment, hallucination, unsafe-output, similarity, teacher acceptance, latency, and cost thresholds are approved and tested.
- **Priority:** Must
- **Delivery state:** Production required
- **User story:** As Product Owner, I want measurable release criteria so that an impressive demo does not create uncontrolled production risk.
- **Acceptance criteria:** Versioned evaluation dataset and thresholds exist; failing model versions are disabled; no minor-identifying data is sent; credentials are secret-managed.
- **Related modules:** AI Evaluation, Security, Privacy, Admin
- **Competition value:** Mature responsible-AI plan.
- **Government-data dependency:** Evaluation verifies citation/source alignment.
- **AI dependency:** Required before live AI.
- **Evidence chain dependency:** Evaluation and provider version are auditable.
